# Fractal Admin — Lifecycle Engine (L2+L3+L4)

## Original Problem Statement
Реализовать полный lifecycle management для институциональной торговой системы:
- L2 Lifecycle Observability
- L3 Governance Hooks (Constitution Binding, Drift Auto-Revoke, Recovery, Integrity)
- L4 Daily Runner Orchestrator

## Architecture
- **Backend**: TypeScript (Fastify) на порту 8001
- **Frontend**: React + TailwindCSS на порту 3000
- **Database**: MongoDB (fractal_dev)

## What's Been Implemented

### L2 — Lifecycle Observability (Feb 22, 2026)
- `/api/lifecycle/state` — Combined state for UI
- `/api/lifecycle/events` — Timeline events with filtering
- `/api/lifecycle/actions/*` — Manual lifecycle actions
- LifecycleTab UI с карточками BTC/SPX, Combined Mode, Timeline

### L3 — Governance Hooks (Feb 22, 2026)
- **L3.1 Constitution Binding** — При изменении hash + APPLIED → WARMUP/SIMULATION
- **L3.2 Drift Auto-Revoke** — APPLIED + CRITICAL → REVOKED
- **L3.3 Drift Recovery** — REVOKED + drift normalized → WARMUP
- **L3.4 State Integrity Guard** — Валидация инвариантов, auto-fix
- **L3.5 Auto-Promotion** — liveSamples >= 30 + OK/WATCH → APPLIED

### L4.1 — Daily Run Orchestrator (Feb 22, 2026)
**Daily-run как единственный дирижёр lifecycle**

Pipeline Steps (строгий порядок):
1. SNAPSHOT_WRITE
2. OUTCOME_RESOLVE  
3. LIVE_SAMPLE_UPDATE
4. DRIFT_CHECK
5. LIFECYCLE_HOOKS
6. WARMUP_PROGRESS_WRITE
7. AUTO_PROMOTE
8. INTEL_TIMELINE_WRITE
9. ALERTS_DISPATCH
10. INTEGRITY_GUARD

API Endpoints:
- `POST /api/ops/daily-run/run-now?asset=BTC|SPX` — Запуск пайплайна
- `GET /api/ops/daily-run/status` — Статус последнего запуска
- `GET /api/ops/daily-run/history` — История запусков

Response Format:
```json
{
  "ok": true,
  "runId": "run-xxx",
  "asset": "BTC",
  "mode": "DEV",
  "durationMs": 15,
  "steps": [...],
  "lifecycle": {
    "before": { "status": "WARMUP", "liveSamples": 30, ... },
    "after": { "status": "WARMUP", "liveSamples": 31, ... },
    "transition": null
  }
}
```

### Files Created
- `/app/backend/src/modules/ops/daily-run/daily_run.types.ts`
- `/app/backend/src/modules/ops/daily-run/daily_run.lifecycle.ts`
- `/app/backend/src/modules/ops/daily-run/daily_run.orchestrator.ts`
- `/app/backend/src/modules/ops/daily-run/daily_run.routes.ts`
- `/app/frontend/src/components/fractal/admin/L4DailyRunCard.jsx`

## System Behavior

### DEV Mode
- Статус: SIMULATION (never auto-promote)
- Daily-run запускается вручную через UI
- Full DEV Controls panel для тестирования

### PROD Mode
- Daily-run по расписанию (cron)
- Auto-promotion: WARMUP → APPLIED при 30+ samples
- Auto-revoke: APPLIED → REVOKED при drift CRITICAL

## Test Status
- L3 Backend: 100% (40/40 tests)
- L4.1 Backend: 100% (30/30 tests)
- Frontend: UI verified via screenshots

## Next Tasks
1. **L4.2** — Auto Warmup Starter (PROD: SIMULATION + live candles → WARMUP)
2. Интеграция snapshot/outcome services в daily-run steps
3. Telegram alerts при AUTO_APPLY / DRIFT_CRITICAL_REVOKE
