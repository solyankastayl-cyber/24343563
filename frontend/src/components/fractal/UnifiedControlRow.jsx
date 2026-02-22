/**
 * UNIFIED CONTROL ROW v3 — Clean Single-Row Design
 * 
 * Structure:
 * [ PRIMARY Signal ] [ Secondary Icons: Confidence | Phase | Risk ] | [ Mode Tabs ] | [ Horizon Tabs ]
 * 
 * One main status, three compact secondary indicators
 */

import React, { useState } from 'react';
import { getTierColor } from '../../hooks/useFocusPack';
import { 
  Pause, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Activity,
  Target,
  Shield,
  CircleDot
} from 'lucide-react';

// Horizons config
const HORIZONS = ['7d', '14d', '30d', '90d', '180d', '365d'];

// Mode config
const MODES = [
  { key: 'price', label: 'Synthetic', description: 'AI model projection based on current structure' },
  { key: 'replay', label: 'Replay', description: 'Historical fractal pattern matching' },
  { key: 'hybrid', label: 'Hybrid', description: 'Combined synthetic + replay analysis' },
  { key: 'spx', label: 'SPX & BTC', description: 'S&P 500 correlation with Bitcoin analysis' },
];

/**
 * Primary Signal — Main status badge
 */
function PrimarySignal({ signal, risk }) {
  // If CRISIS - show crisis as primary
  const isCrisis = risk === 'CRISIS';
  
  const configs = {
    BUY: { 
      icon: TrendingUp, 
      bg: 'bg-emerald-500',
      label: 'BUY'
    },
    SELL: { 
      icon: TrendingDown, 
      bg: 'bg-red-500',
      label: 'SELL'
    },
    HOLD: { 
      icon: Pause, 
      bg: 'bg-amber-500',
      label: 'HOLD'
    },
    CRISIS: {
      icon: AlertTriangle,
      bg: 'bg-red-600',
      label: 'CRISIS'
    }
  };
  
  const config = isCrisis ? configs.CRISIS : (configs[signal] || configs.HOLD);
  const Icon = config.icon;
  
  return (
    <div 
      className="flex items-center gap-2.5"
      title={isCrisis ? 'Crisis mode - extreme volatility' : `Global signal: ${signal}`}
    >
      <div className={`
        w-9 h-9 rounded-lg ${config.bg}
        flex items-center justify-center
      `}>
        <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-base font-bold text-slate-800">
        {config.label}
      </span>
    </div>
  );
}

/**
 * Secondary Indicator — Compact icon with tooltip
 */
function SecondaryIndicator({ icon: Icon, value, label, tooltip, variant = 'default' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Color based on variant
  const variantStyles = {
    default: 'text-slate-400 hover:text-slate-600',
    warning: 'text-amber-500 hover:text-amber-600',
    danger: 'text-red-500 hover:text-red-600',
    success: 'text-emerald-500 hover:text-emerald-600',
  };
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`
        flex items-center gap-1.5 px-2 py-1 rounded-md cursor-help
        transition-colors ${variantStyles[variant]}
        hover:bg-slate-100
      `}>
        <Icon className="w-4 h-4" strokeWidth={2} />
        <span className="text-xs font-medium">{value}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="
          absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
          px-3 py-2 bg-slate-800 rounded-lg shadow-xl
          text-white text-xs whitespace-nowrap
        ">
          <div className="font-semibold mb-0.5">{label}</div>
          <div className="text-slate-300">{tooltip}</div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
        </div>
      )}
    </div>
  );
}

/**
 * Status Block — Primary + Secondary indicators
 */
function StatusBlock({ signal, confidence, marketMode, risk }) {
  // Confidence variant
  const confVariant = confidence === 'Low' ? 'warning' : confidence === 'High' ? 'success' : 'default';
  const confTooltip = {
    High: 'Strong conviction across indicators',
    Medium: 'Moderate certainty',
    Low: 'High uncertainty - proceed with caution'
  };
  
  // Phase variant
  const phaseVariant = ['MARKDOWN', 'DISTRIBUTION'].includes(marketMode) ? 'warning' : 'default';
  const phaseTooltip = {
    ACCUMULATION: 'Smart money building positions',
    DISTRIBUTION: 'Smart money reducing exposure',
    MARKUP: 'Bullish trend in progress',
    MARKDOWN: 'Bearish trend in progress',
    RECOVERY: 'Market recovering from lows'
  };
  
  // Risk variant (only show if not Normal and not CRISIS - CRISIS shown as primary)
  const showRiskIndicator = risk && risk !== 'Normal' && risk !== 'CRISIS';
  const riskVariant = risk === 'HIGH' ? 'danger' : 'warning';
  
  return (
    <div className="flex items-center gap-4">
      {/* Primary Signal */}
      <PrimarySignal signal={signal} risk={risk} />
      
      {/* Divider */}
      <div className="w-px h-8 bg-slate-200" />
      
      {/* Secondary Indicators */}
      <div className="flex items-center gap-1">
        <SecondaryIndicator 
          icon={Target}
          value={confidence}
          label="Confidence"
          tooltip={confTooltip[confidence] || 'Model confidence level'}
          variant={confVariant}
        />
        
        <SecondaryIndicator 
          icon={Activity}
          value={marketMode}
          label="Market Phase"
          tooltip={phaseTooltip[marketMode] || 'Current market cycle phase'}
          variant={phaseVariant}
        />
        
        {showRiskIndicator && (
          <SecondaryIndicator 
            icon={Shield}
            value={risk}
            label="Risk Level"
            tooltip="Elevated volatility environment"
            variant={riskVariant}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Mode Tabs - Centered, larger
 */
function ModeTabs({ mode, onChange, loading }) {
  return (
    <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl">
      {MODES.map(m => {
        const isActive = mode === m.key;
        return (
          <button
            key={m.key}
            onClick={() => onChange?.(m.key)}
            disabled={loading}
            title={m.description}
            className={`
              px-5 py-2.5 text-sm font-semibold rounded-lg transition-all
              ${isActive 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
              ${loading ? 'opacity-50' : ''}
            `}
            data-testid={`mode-${m.key}`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Horizon Tabs - Larger with tier colors
 */
function HorizonTabs({ focus, onChange, loading }) {
  return (
    <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl">
      {HORIZONS.map(h => {
        const isActive = focus === h;
        const tier = ['7d', '14d'].includes(h) ? 'TIMING' 
          : ['30d', '90d'].includes(h) ? 'TACTICAL' 
          : 'STRUCTURE';
        const tierColor = getTierColor(tier);
        
        return (
          <button
            key={h}
            onClick={() => onChange?.(h)}
            disabled={loading}
            className={`
              relative px-4 py-2.5 text-sm font-semibold rounded-lg transition-all
              ${isActive 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
              ${loading ? 'opacity-50' : ''}
            `}
            data-testid={`horizon-${h}`}
          >
            {h.toUpperCase()}
            {/* Tier indicator */}
            <div 
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full transition-opacity"
              style={{ backgroundColor: tierColor, opacity: isActive ? 1 : 0.3 }}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Main Unified Control Row v3
 */
export function UnifiedControlRow({
  signal = 'HOLD',
  confidence = 'Medium',
  marketMode = 'ACCUMULATION',
  risk = 'Normal',
  chartMode = 'price',
  onModeChange,
  focus = '30d',
  onFocusChange,
  loading = false,
}) {
  return (
    <div 
      className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200"
      data-testid="unified-control-row"
    >
      {/* LEFT: Status Block (Primary + Secondary) */}
      <StatusBlock 
        signal={signal}
        confidence={confidence}
        marketMode={marketMode}
        risk={risk}
      />
      
      {/* CENTER: Mode Tabs */}
      <ModeTabs 
        mode={chartMode}
        onChange={onModeChange}
        loading={loading}
      />
      
      {/* RIGHT: Horizon Tabs */}
      <HorizonTabs 
        focus={focus}
        onChange={onFocusChange}
        loading={loading}
      />
    </div>
  );
}

export default UnifiedControlRow;
