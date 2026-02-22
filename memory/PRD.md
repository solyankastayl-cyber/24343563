# Fractal Module PRD

## Original Problem Statement
UX-рефакторинг модуля Fractal: улучшение Hybrid Dual View, Replay, таймфреймы, карточки. Привести к человеческому виду без изменения логики расчётов.

## Architecture
- **Frontend**: React (localhost:3000)
- **Backend**: FastAPI proxy (8001) -> TypeScript backend (8002)
- **Database**: MongoDB

## User Personas
- Трейдеры, аналитики, использующие фрактальный анализ для прогнозирования

## Core Requirements
1. График 100% ширины - неприкосновенный
2. Никаких изменений в алгоритмах и расчётах
3. Только визуальные улучшения и UX

## What's Been Implemented (Jan 2026)

### Session 1: UX Refactor
**Completed:**
1. **Select Historical Match** - заменил "SELECT REPLAY" с пояснением
2. **Full Phase Names** - ACC→Accumulation, DIS→Distribution, REC→Recovery, MAR→Markdown
3. **Match Quality X/100** - заменил непонятный "C (67)" badge
4. **Hybrid Projection** - переформатирован:
   - "Forecast (Model)" блок с пояснением
   - "Historical Replay" блок с matched period и similarity
5. **Agreement Section** - заменил DIVERGENCE:
   - "Agreement between Model and Replay"
   - Direction Match (вместо Dir Mismatch)
   - Terminal Difference (вместо Terminal Δ)
   - Человеческие подсказки под каждой метрикой
6. **HorizonSelector** - добавил "Projection Horizon" с пояснением
7. **Phase Filter Bar** - полные названия фаз

## Prioritized Backlog (P0/P1/P2)

### P1 - Next Priority
- Улучшить Expected Outcomes карточки (BEAR/BASE/BULL)
- Добавить tooltips к Risk блоку

### P2 - Future
- Анимации при переключении режимов
- Mobile responsive версия

## Next Tasks
- Тестирование на production данных
- Получить feedback от пользователей

## Session 2: System Status Panel (Jan 2026)

**Task:** Объединить дублирующиеся блоки в один System Status Panel

**Completed:**
1. **SystemStatusPanel** — единая панель с 3 колонками:
   - Market State: Phase, Consensus, Sync State, Structure Weight, Divergence
   - Projection Context: Focus, Window, Aftermath, Matches, Sample, Coverage, Quality
   - Data Status: Real/Fallback badge, match count, confidence level

2. **Удалено дублирование:**
   - ConsensusPulseStrip (перенесено в SystemStatusPanel)
   - FocusInfoPanel (перенесено в SystemStatusPanel)
   - DataStatusIndicator inline (перенесено в SystemStatusPanel)
   - Строки Window/Aftermath/Matches/Sample под HorizonSelector

3. **Исправлено:**
   - "Tactical View View" → "Tactical View"
   - Phase "UNKNOWN" → правильное извлечение phaseSnapshot.phase

**Known Issues:**
- focus-pack API возвращает 520 error (не критично, данные загружаются через terminal endpoint)
