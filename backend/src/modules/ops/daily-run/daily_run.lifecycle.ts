/**
 * L4.1 — Daily Run Lifecycle Integration
 * 
 * Single point where all lifecycle transitions happen.
 * Called ONLY from daily-run orchestrator.
 */

import { Db } from 'mongodb';
import { 
  applyConstitutionHook, 
  handleDriftUpdateHook, 
  checkAutoPromotionHook,
  incrementLiveSamplesHook 
} from '../../lifecycle/lifecycle.hooks.js';
import { enforceIntegrity } from '../../lifecycle/lifecycle.integrity.js';
import type { DailyRunContext, LifecycleSnapshot, DailyRunAsset } from './daily_run.types.js';

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE STATE HELPERS
// ═══════════════════════════════════════════════════════════════

export async function getLifecycleSnapshot(
  db: Db,
  asset: DailyRunAsset
): Promise<LifecycleSnapshot | null> {
  const stateCollection = db.collection('model_lifecycle_state');
  const state = await stateCollection.findOne({ modelId: asset });
  
  if (!state) return null;
  
  return {
    status: state.status || 'SIMULATION',
    systemMode: state.systemMode || 'DEV',
    liveSamples: state.live?.liveSamples || 0,
    warmupProgress: state.warmup?.progressPct || 0,
    driftSeverity: state.drift?.severity || 'OK',
    constitutionHash: state.constitutionHash || null,
  };
}

// ═══════════════════════════════════════════════════════════════
// STEP: LIVE_SAMPLE_UPDATE
// ═══════════════════════════════════════════════════════════════

export interface LiveSampleUpdateResult {
  before: number;
  after: number;
  delta: number;
}

export async function runLiveSampleUpdate(
  db: Db,
  ctx: DailyRunContext,
  resolvedOutcomes: number
): Promise<LiveSampleUpdateResult> {
  const before = ctx.lifecycle.before?.liveSamples || 0;
  
  // Increment by resolved outcomes (if any)
  if (resolvedOutcomes > 0) {
    await incrementLiveSamplesHook(db, ctx.asset, resolvedOutcomes);
    ctx.logs.push(`[LiveSamples] Incremented by ${resolvedOutcomes}`);
  }
  
  // Get updated state
  const afterState = await getLifecycleSnapshot(db, ctx.asset);
  const after = afterState?.liveSamples || before;
  
  ctx.metrics.liveSamplesBefore = before;
  ctx.metrics.liveSamplesAfter = after;
  
  return { before, after, delta: after - before };
}

// ═══════════════════════════════════════════════════════════════
// STEP: DRIFT_CHECK
// ═══════════════════════════════════════════════════════════════

export interface DriftCheckResult {
  severity: string;
  revoked: boolean;
  recovered: boolean;
}

export async function runDriftCheck(
  db: Db,
  ctx: DailyRunContext,
  computedSeverity: string
): Promise<DriftCheckResult> {
  // Update drift and trigger auto-revoke/recovery if needed
  const result = await handleDriftUpdateHook(
    db,
    ctx.asset,
    computedSeverity as any,
    {}
  );
  
  ctx.metrics.driftSeverity = computedSeverity;
  
  if (result.revoked) {
    ctx.logs.push(`[Drift] Auto-revoked due to CRITICAL severity`);
    ctx.warnings.push(`Model ${ctx.asset} auto-revoked (drift CRITICAL)`);
  }
  
  return {
    severity: computedSeverity,
    revoked: result.revoked,
    recovered: false, // Recovery happens inside handleDriftUpdateHook
  };
}

// ═══════════════════════════════════════════════════════════════
// STEP: LIFECYCLE_HOOKS (combined logic point)
// ═══════════════════════════════════════════════════════════════

export interface LifecycleHooksResult {
  statusBefore: string;
  statusAfter: string;
  transition: string | null;
  events: string[];
}

export async function runLifecycleHooks(
  db: Db,
  ctx: DailyRunContext
): Promise<LifecycleHooksResult> {
  const stateCollection = db.collection('model_lifecycle_state');
  const beforeState = await stateCollection.findOne({ modelId: ctx.asset });
  const statusBefore = beforeState?.status || 'SIMULATION';
  
  const events: string[] = [];
  
  // Constitution binding is handled via governance apply endpoint
  // Drift update already handled in DRIFT_CHECK step
  // Here we just record what happened
  
  const afterState = await stateCollection.findOne({ modelId: ctx.asset });
  const statusAfter = afterState?.status || 'SIMULATION';
  
  const transition = statusBefore !== statusAfter 
    ? `${statusBefore} → ${statusAfter}` 
    : null;
  
  if (transition) {
    ctx.logs.push(`[Lifecycle] Status transition: ${transition}`);
    events.push(`STATUS_CHANGED: ${transition}`);
  }
  
  return {
    statusBefore,
    statusAfter,
    transition,
    events,
  };
}

// ═══════════════════════════════════════════════════════════════
// STEP: WARMUP_PROGRESS_WRITE
// ═══════════════════════════════════════════════════════════════

export interface WarmupProgressResult {
  before: number;
  after: number;
  status: string;
}

export async function runWarmupProgressWrite(
  db: Db,
  ctx: DailyRunContext
): Promise<WarmupProgressResult> {
  const stateCollection = db.collection('model_lifecycle_state');
  const state = await stateCollection.findOne({ modelId: ctx.asset });
  
  const status = state?.status || 'SIMULATION';
  const before = state?.warmup?.progressPct || 0;
  
  // Only update if in WARMUP
  if (status === 'WARMUP') {
    const warmup = state?.warmup || {};
    const targetDays = warmup.targetDays || 30;
    const resolvedDays = (warmup.resolvedDays || 0) + 1;
    const progressPct = Math.min(100, Math.round((resolvedDays / targetDays) * 100));
    
    await stateCollection.updateOne(
      { modelId: ctx.asset },
      {
        $set: {
          'warmup.resolvedDays': resolvedDays,
          'warmup.progressPct': progressPct,
          'warmup.lastRunAt': ctx.now.toISOString(),
          updatedAt: ctx.now.toISOString(),
        },
      }
    );
    
    ctx.metrics.warmupProgressBefore = before;
    ctx.metrics.warmupProgressAfter = progressPct;
    ctx.logs.push(`[Warmup] Progress: ${before}% → ${progressPct}%`);
    
    return { before, after: progressPct, status };
  }
  
  ctx.metrics.warmupProgressBefore = before;
  ctx.metrics.warmupProgressAfter = before;
  
  return { before, after: before, status };
}

// ═══════════════════════════════════════════════════════════════
// STEP: AUTO_PROMOTE
// ═══════════════════════════════════════════════════════════════

export interface AutoPromoteResult {
  promoted: boolean;
  blocked: boolean;
  reason: string;
}

export async function runAutoPromote(
  db: Db,
  ctx: DailyRunContext
): Promise<AutoPromoteResult> {
  const result = await checkAutoPromotionHook(db, ctx.asset);
  
  if (result.promoted) {
    ctx.logs.push(`[AutoPromote] Model promoted to APPLIED`);
    ctx.warnings.push(`Model ${ctx.asset} auto-promoted to APPLIED!`);
  } else if (result.blocked) {
    ctx.logs.push(`[AutoPromote] Blocked: ${result.reason}`);
  } else {
    ctx.logs.push(`[AutoPromote] Not eligible: ${result.reason}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// STEP: INTEGRITY_GUARD
// ═══════════════════════════════════════════════════════════════

export interface IntegrityGuardResult {
  valid: boolean;
  fixes: string[];
}

export async function runIntegrityGuard(
  db: Db,
  ctx: DailyRunContext
): Promise<IntegrityGuardResult> {
  const stateCollection = db.collection('model_lifecycle_state');
  const eventsCollection = db.collection('model_lifecycle_events');
  
  const state = await stateCollection.findOne({ modelId: ctx.asset });
  if (!state) {
    return { valid: true, fixes: [] };
  }
  
  const integrityResult = enforceIntegrity(null, state as any);
  
  if (!integrityResult.valid) {
    // Apply fixes
    await stateCollection.updateOne(
      { modelId: ctx.asset },
      { $set: { ...integrityResult.state, updatedAt: ctx.now.toISOString() } }
    );
    
    // Log event
    await eventsCollection.insertOne({
      modelId: ctx.asset,
      engineVersion: 'v2.1',
      ts: ctx.now.toISOString(),
      type: 'STATE_AUTOFIX',
      actor: 'SYSTEM',
      meta: { fixes: integrityResult.fixes, source: 'daily-run' },
    });
    
    ctx.logs.push(`[Integrity] Fixed: ${integrityResult.fixes.join(', ')}`);
    ctx.warnings.push(`State integrity fixed: ${integrityResult.fixes.join(', ')}`);
  }
  
  return {
    valid: integrityResult.valid,
    fixes: integrityResult.fixes,
  };
}

console.log('[DailyRun] Lifecycle integration loaded (L4.1)');
