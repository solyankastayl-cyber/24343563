# Fractal Admin — Lifecycle Engine (L2+L3+L4) + User Terminal (U2)

## Original Problem Statement
Институциональная торговая система с полным lifecycle management и user-friendly terminal.

## Architecture
- **Backend**: TypeScript (Fastify) на порту 8001
- **Frontend**: React + TailwindCSS на порту 3000
- **Database**: MongoDB (fractal_dev)

## Implementation Status

### L2 — Lifecycle Observability ✅
- `/api/lifecycle/state` — Combined state for UI
- `/api/lifecycle/events` — Timeline events
- `/api/lifecycle/actions/*` — Manual lifecycle actions
- LifecycleTab UI

### L3 — Governance Hooks ✅
- **L3.1** Constitution Binding
- **L3.2** Drift Auto-Revoke
- **L3.3** Drift Recovery
- **L3.4** State Integrity Guard
- **L3.5** Auto-Promotion

### L4.1 — Daily Run Orchestrator ✅
11 шагов в строгом порядке:
1. SNAPSHOT_WRITE
2. OUTCOME_RESOLVE
3. LIVE_SAMPLE_UPDATE
4. DRIFT_CHECK
5. **AUTO_WARMUP** (L4.2)
6. LIFECYCLE_HOOKS
7. WARMUP_PROGRESS_WRITE
8. AUTO_PROMOTE
9. INTEL_TIMELINE_WRITE
10. ALERTS_DISPATCH
11. INTEGRITY_GUARD

### L4.2 — Auto Warmup Starter ✅
При daily-run в PROD режиме:
- systemMode === PROD
- status === SIMULATION
- liveSamples > 0
- constitutionHash exists
- drift !== CRITICAL
→ AUTO_WARMUP_STARTED → status = WARMUP

### U2 — As-of Date Picker ✅
- Live mode: использует latest данные
- Simulation mode: выбор исторической даты
- Quick presets: 1M ago, 3M ago, 6M ago, 1Y ago
- Интеграция с useFocusPack hook
- API поддерживает `?asOf=YYYY-MM-DD` параметр

## System Behavior

### PROD Mode
SIMULATION + live candles
→ daily-run → AUTO_WARMUP
→ 30 samples → AUTO_PROMOTE → APPLIED
→ drift CRITICAL → AUTO_REVOKE → REVOKED
→ drift recovery → WARMUP
→ 30 samples → APPLIED

### DEV Mode
- Всегда SIMULATION
- Manual controls через DEV Controls panel
- Full testing capabilities

## Test Status
- L4.1 + L4.2 Backend: 100% (34/34)
- U2 Frontend: 100%
- L3 Backend: 100% (40/40)

## Next Tasks
1. **U3** — Multi-Horizon: real backend calls for all horizons (7d/14d/30d/90d/180d/365d)
2. **U4** — Hybrid Chart: dual view (Synthetic + Replay) with proper price axes
3. **U5** — Human-friendly header (Neutral/Bias Up/Down, confidence, phase tooltips)
