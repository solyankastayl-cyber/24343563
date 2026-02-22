# Fractal Admin — Lifecycle Engine (L2+L3)

## Original Problem Statement
Реализовать L3 блоки для Lifecycle Management:
- L3.1 Constitution Binding
- L3.2 Drift Auto-Revoke
- L3.3 Drift Recovery
- L3.4 State Integrity Guard
- L3.5 Auto-Promotion

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

**L3.1 Constitution Binding**
- `/api/lifecycle/constitution/apply` — Applies constitution hash
- Если hash изменился + модель APPLIED → сброс в WARMUP (PROD) или SIMULATION (DEV)
- Event: CONSTITUTION_APPLIED

**L3.2 Drift Auto-Revoke**
- `/api/lifecycle/drift/update` — Обновляет drift severity
- Если APPLIED + drift=CRITICAL → автоматический REVOKED
- Event: DRIFT_CRITICAL_REVOKE

**L3.3 Drift Recovery**
- Встроено в drift update hook
- Если REVOKED + drift восстановился из CRITICAL → переход в WARMUP
- Event: DRIFT_RECOVERY_WARMUP

**L3.4 State Integrity Guard**
- `/api/lifecycle/integrity/check` — Проверяет и исправляет инварианты
- DEV mode не может иметь APPLIED статус
- WARMUP обязан иметь warmup блок
- APPLIED требует liveSamples >= 30 и drift != CRITICAL
- Event: STATE_AUTOFIX

**L3.5 Auto-Promotion**
- `/api/lifecycle/samples/increment` — Инкремент live samples
- `/api/lifecycle/check-promotion` — Проверка eligibility
- При liveSamples >= 30 + drift OK/WATCH + PROD → WARMUP→APPLIED
- Event: AUTO_APPLY

### Files Created/Modified
- `/app/backend/src/modules/lifecycle/lifecycle.hooks.ts` — L3.1-L3.5 хуки
- `/app/backend/src/modules/lifecycle/lifecycle.integrity.ts` — L3.4 валидация
- `/app/backend/src/modules/lifecycle/lifecycle.routes.ts` — L3 эндпоинты
- `/app/frontend/src/components/fractal/admin/LifecycleTab.jsx` — DEV Controls + L3 UI
- `/app/frontend/src/api/lifecycle.api.js` — L3 API клиент

## System Behavior

### DEV Mode
- Статус: SIMULATION (never auto-promote)
- Constitution apply → остаётся SIMULATION
- Drift CRITICAL → no auto-revoke (только warning)
- Full DEV Controls panel для тестирования

### PROD Mode
- Auto-promotion: WARMUP → APPLIED при 30+ samples
- Auto-revoke: APPLIED → REVOKED при drift CRITICAL
- Recovery: REVOKED → WARMUP при drift recovery
- Constitution change: APPLIED → WARMUP

## Test Status
- Backend: 100% (40/40 tests passed)
- Frontend: UI verified via screenshot

## Next Tasks
1. Governance UI для apply constitution через интерфейс
2. Daily Runner интеграция с lifecycle hooks
3. Drift monitoring интеграция
