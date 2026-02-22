/**
 * UNIFIED CONTROL ROW v2 — Clean, Centered Design
 * 
 * Structure:
 * [ Signal Status with Icon + Tooltip ] | [ Mode Tabs CENTERED ] | [ Horizon Tabs ]
 * 
 * Larger, cleaner, professional look
 */

import React, { useState } from 'react';
import { getTierColor } from '../../hooks/useFocusPack';
import { 
  Pause, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Activity,
  Zap,
  Target,
  Shield
} from 'lucide-react';

// Horizons config
const HORIZONS = ['7d', '14d', '30d', '90d', '180d', '365d'];

// Mode config - renamed for clarity
const MODES = [
  { key: 'price', label: 'Synthetic', description: 'AI model projection based on current structure' },
  { key: 'replay', label: 'Replay', description: 'Historical fractal pattern matching' },
  { key: 'hybrid', label: 'Hybrid', description: 'Combined synthetic + replay analysis' },
  { key: 'spx', label: 'SPX & BTC', description: 'S&P 500 correlation with Bitcoin analysis' },
];

/**
 * Signal Badge with Icon and Tooltip
 */
function SignalBadge({ signal, confidence, marketMode, risk }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Signal config
  const signalConfig = {
    BUY: { 
      icon: TrendingUp, 
      color: 'bg-emerald-500', 
      textColor: 'text-emerald-700',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      description: 'Bullish signal - favorable conditions for entry'
    },
    SELL: { 
      icon: TrendingDown, 
      color: 'bg-red-500', 
      textColor: 'text-red-700',
      bgLight: 'bg-red-50',
      border: 'border-red-200',
      description: 'Bearish signal - consider reducing exposure'
    },
    HOLD: { 
      icon: Pause, 
      color: 'bg-amber-500', 
      textColor: 'text-amber-700',
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      description: 'Neutral signal - wait for clarity before action'
    },
  };
  
  const config = signalConfig[signal] || signalConfig.HOLD;
  const Icon = config.icon;
  
  // Confidence description
  const confidenceDesc = {
    High: 'Strong conviction based on multiple confirming factors',
    Medium: 'Moderate conviction with some conflicting signals',
    Low: 'Low conviction - high uncertainty in current conditions'
  };
  
  // Market mode description
  const modeDesc = {
    ACCUMULATION: 'Smart money accumulating - potential bottom formation',
    DISTRIBUTION: 'Smart money distributing - potential top formation',
    MARKUP: 'Trending upward - bullish momentum phase',
    MARKDOWN: 'Trending downward - bearish momentum phase',
    RECOVERY: 'Transitioning from bearish to neutral/bullish',
  };
  
  // Risk description
  const riskDesc = {
    CRISIS: 'Extreme volatility - maximum caution advised',
    HIGH: 'Elevated risk environment - reduce position sizes',
    Normal: 'Standard market conditions',
    LOW: 'Low volatility - favorable for position building'
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Badge */}
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl cursor-help
        ${config.bgLight} ${config.border} border
        transition-all hover:shadow-md
      `}>
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-lg ${config.color} 
          flex items-center justify-center
        `}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Text */}
        <div className="flex flex-col">
          <span className={`text-lg font-bold ${config.textColor}`}>
            {signal}
          </span>
          <span className="text-xs text-slate-500">
            {confidence} · {marketMode}
          </span>
        </div>
        
        {/* Risk indicator */}
        {risk && risk !== 'Normal' && (
          <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-red-100 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-semibold text-red-600">{risk}</span>
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="
          absolute top-full left-0 mt-2 z-50
          w-80 p-4 bg-slate-900 rounded-xl shadow-2xl
          text-white text-sm
        ">
          <div className="space-y-3">
            {/* Signal */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="font-semibold">{signal} Signal</span>
              </div>
              <p className="text-slate-300 text-xs">{config.description}</p>
            </div>
            
            {/* Confidence */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">Confidence: {confidence}</span>
              </div>
              <p className="text-slate-300 text-xs">{confidenceDesc[confidence]}</p>
            </div>
            
            {/* Market Mode */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">Phase: {marketMode}</span>
              </div>
              <p className="text-slate-300 text-xs">{modeDesc[marketMode] || 'Current market phase'}</p>
            </div>
            
            {/* Risk */}
            {risk && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Risk: {risk}</span>
                </div>
                <p className="text-slate-300 text-xs">{riskDesc[risk] || 'Current risk level'}</p>
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <div className="absolute -top-2 left-6 w-4 h-4 bg-slate-900 rotate-45" />
        </div>
      )}
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
 * Main Unified Control Row v2
 */
export function UnifiedControlRow({
  signal = 'HOLD',
  confidence = 'Medium',
  marketMode = 'Accumulation',
  risk = 'Normal',
  chartMode = 'price',
  onModeChange,
  focus = '30d',
  onFocusChange,
  loading = false,
}) {
  return (
    <div 
      className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200"
      data-testid="unified-control-row"
    >
      {/* LEFT: Signal Status */}
      <SignalBadge 
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
