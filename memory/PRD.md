# SPX Regime Engine PRD

## Original Problem Statement
Клонировать репозиторий https://github.com/solyankastayl-cyber/yyfy5656, поднять фронт, бэк и админку. Работать только с областью Fractal. Доработать логику обновления на фронте.

## Architecture
- **Frontend**: React + Tailwind CSS
- **Backend**: Fastify (TypeScript) + FastAPI (Python proxy)
- **Database**: MongoDB
- **Module**: SPX Regime Engine (B6.11-B6.15)

## Core Requirements
1. SPX Regime Decomposition Engine (B6.11)
2. Regime Matrix UI with skill metrics (B6.12)
3. Constitution Generation (B6.14)
4. Governance Lifecycle (B6.15)
5. Frontend update logic after recompute

## What's Been Implemented

### 2026-02-22
- [x] Repository cloned and environment setup
- [x] Backend running on port 8002 (TypeScript Fractal server)
- [x] Frontend running on port 3000
- [x] MongoDB connected with fractal_dev database
- [x] SPX data ingested: 19,121 candles (1950-2026)
- [x] Regimes computed: 19,061 daily regime tags
- [x] Outcomes generated: 113,889 samples
- [x] Constitution generated: v2.1771749995746 (17 policies)
- [x] **FIXED: handleRecompute in SpxRegimesTab.jsx now calls generate-outcomes after recompute regimes**
- [x] **UI REDESIGN: SPX admin tabs updated with light color scheme matching BTC module**
- [x] **RUSSIAN INTERFACE: All SPX tabs now have Russian tooltips and descriptions**
- [x] **InfoTooltip components added with hover explanations for all KPI cards**

### Key Fix Applied
File: `/app/frontend/src/components/fractal/admin/SpxRegimesTab.jsx`
- Added Step 2: Generate outcomes for skill matrix after regime recompute
- This ensures the skill matrix updates correctly with new data

## User Personas
1. **Institutional Traders** - Use SPX regime analysis for position sizing
2. **Quant Researchers** - Analyze regime stability across decades
3. **Risk Managers** - Use constitution for risk gates

## P0 Features (Completed)
- [x] SPX Regimes Tab with skill matrix
- [x] Constitution Tab with decade stability
- [x] Governance Tab with backtest results
- [x] Frontend update logic fix

## P1 Features (Backlog)
- [ ] Terminal integration (header badge + size multiplier)
- [ ] Auto-refresh on data updates
- [ ] Export functionality for regime reports

## P2 Features (Future)
- [ ] Combined BTC+SPX analysis
- [ ] Real-time regime detection
- [ ] Alert system for regime changes

## Next Tasks
1. Test Recompute Regimes button functionality
2. Add progress indicators for long-running operations
3. Terminal integration with regime badges
