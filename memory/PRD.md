# Fractal Module PRD

## Original Problem Statement
Клонировать репозиторий, развернуть фронт, бэк и админку. Работать только с модулем Fractal.
Реализовать задачи U3, U4, U5, U6, U7.

## Implemented Features

### U3 — Multi-Horizon (DONE - 2026-02-22)
- Backend returns different matches for different horizons (7d=30, 30d=20, 365d=10)
- `horizon` field added to meta response
- DataStatusIndicator shows DATA: REAL/FALLBACK with reasons

### U4 — Hybrid Chart (DONE - 2026-02-22)
- HybridSummaryPanel shows both % returns AND price targets
- ForecastTooltip for hover in forecast zone shows prices/dates/returns
- Price formatting with K/M suffix

### U5 — Signal Header (DONE - 2026-02-22)
- 4 human-friendly cards: Signal, Confidence, Market Mode, Risk
- Advanced metrics toggle with raw scores
- Tooltips explaining each metric

### U6 — Scenarios 2.0 (DONE - 2026-02-22)
- ScenarioBox component with Bear/Base/Bull cards
- Target prices calculated: basePrice * (1 + return)
- RangeStrip showing P10-P90 visual range
- OutcomeStats: probUp, avgMaxDD, tailRiskP95, sampleSize
- DATA: REAL/FALLBACK indicator

### U7 — Risk Box 2.0 (DONE - 2026-02-22)
- RiskHeader: Risk Level (NORMAL/ELEVATED/CRISIS), Vol Regime badge, Drift status
- DrawdownStats: Expected Max DD, Tail Risk P95 with tooltips
- PositionSizing: Final size with bullet reasons, formula in Advanced
- Blockers: Trading disabled warnings when mode = NO_TRADE
- Correct crisis behavior: finalSize=0 when VOL_CRISIS active

## Architecture

### Backend (Node.js/Fastify)
- `/api/fractal/v2.1/focus-pack` - Returns scenario pack
- `/api/fractal/v2.1/terminal` - Returns volatility, sizing, decisionKernel

### Frontend Components
- `ScenarioBox.jsx` - U6: Bear/Base/Bull scenarios
- `RiskBox.jsx` - U7: Risk & Position sizing
- `SignalHeader.jsx` - U5: 4 signal cards
- `DataStatusIndicator.jsx` - U3: REAL/FALLBACK

## Testing Status (2026-02-22)
- Backend: 100%
- Frontend: 100%
- Integration: 100%

## Acceptance Criteria Status

### U7 ✅
- [x] Size changes with horizon (DD metrics different for 7d vs 365d)
- [x] Size changes with VOL regime (CRISIS = 0%)
- [x] Crisis mode shows red UI
- [x] Guardrail BLOCK disables trading (NO_TRADE mode)
- [x] Blockers list shows all active blocks

## Current System State
- Vol Regime: CRISIS
- Position Sizing: NO_TRADE (0%)
- Active Blockers: LOW_CONFIDENCE, HIGH_ENTROPY, VOL_CRISIS, EXTREME_VOL_SPIKE
- Risk Level: CRISIS
- This is correct protective behavior during high volatility

## Next Action Items
1. BTC page is now production-ready as etalon
2. Copy structure to SPX
3. Add phaseSnapshot to improve Market Mode card

## P0/P1/P2 Features Remaining

### P0 (Critical)
- None - All U3-U7 implemented

### P1 (Important)
- SPX copy of BTC structure
- phaseSnapshot in terminal endpoint
- Preset selector (Conservative/Balanced/Aggressive)

### P2 (Nice to have)
- Simple/Pro mode toggle
- Historical accuracy tracking

## User Personas
- Institutional Traders - Need quick signal + risk assessment
- Retail Traders - Need clear scenarios + blockers explanation
- Researchers - Need advanced formula breakdown
