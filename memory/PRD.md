# Fractal Admin — L2 Lifecycle UI + Diagnostics

## Original Problem Statement
Клонировать репозиторий, поднять фронт, бэк, админку. Работать только с областью Fractal. Реализовать BLOCK L2 — Lifecycle UI + Diagnostics.

## Architecture
- **Backend**: FastAPI-like TypeScript (Fastify) на порту 8001
- **Frontend**: React + TailwindCSS на порту 3000
- **Database**: MongoDB (fractal_dev)

## Tech Stack
- Backend: TypeScript, Fastify, Mongoose, MongoDB
- Frontend: React 19, TailwindCSS, Lucide React icons
- Entry point: `yarn fractal` (src/app.fractal.ts)

## What's Been Implemented (Feb 22, 2026)

### L2 Lifecycle Engine (Backend)
- `/api/lifecycle/state` — Combined state for UI (BTC + SPX + Combined readiness)
- `/api/lifecycle/events` — Timeline events with filtering
- `/api/lifecycle/diagnostics` — Model diagnostics
- `/api/lifecycle/actions/force-warmup` — Start warmup period
- `/api/lifecycle/actions/force-apply` — Force apply model
- `/api/lifecycle/actions/revoke` — Revoke applied model
- `/api/lifecycle/actions/reset-simulation` — Reset to simulation (DEV only)
- `/api/lifecycle/init` — Initialize default states for BTC/SPX

### L2 Lifecycle UI (Frontend)
- **LifecycleTab.jsx** — Main lifecycle management tab
- **CombinedStatusCard** — Shows Combined mode readiness and blockers
- **LifecycleCard** — Per-model cards (BTC/SPX) with:
  - Status badges (SIMULATION, WARMUP, APPLIED, REVOKED)
  - System mode (DEV/PROD)
  - Live samples progress (0/30)
  - Drift severity indicator
  - Warmup progress bar
  - Action buttons
- **LifecycleTimeline** — Event audit trail with filtering

### Files Modified/Created
- `/app/backend/src/modules/lifecycle/lifecycle.service.ts` — Enhanced with L2 methods
- `/app/backend/src/modules/lifecycle/lifecycle.routes.ts` — Added L2 endpoints
- `/app/frontend/src/api/lifecycle.api.js` — API client
- `/app/frontend/src/components/fractal/admin/LifecycleTab.jsx` — Main UI component
- `/app/frontend/src/components/fractal/admin/AdminDashboard.js` — Integrated Lifecycle tab

## User Personas
- **Institutional Operator**: Uses lifecycle tab to manage model states, monitor drift, control warmup periods
- **Developer (DEV mode)**: Tests lifecycle transitions, resets simulation states

## Prioritized Backlog
### P0 - Core (DONE)
- [x] Lifecycle state API
- [x] Events timeline
- [x] BTC/SPX cards with status
- [x] Action buttons (warmup, apply, revoke, reset)
- [x] Combined readiness display

### P1 - Enhancements
- [ ] Real-time WebSocket updates for lifecycle state
- [ ] Historical Sharpe / Live Sharpe comparison in diagnostics
- [ ] Daily run integration with warmup progress

### P2 - Future
- [ ] Auto-promotion after 30 days warmup in PROD
- [ ] Drift alerts integration
- [ ] Constitution hash display and validation

## Next Tasks
1. Test warmup auto-promotion logic when live samples reach 30
2. Add drift monitoring integration
3. Implement constitution hash display
