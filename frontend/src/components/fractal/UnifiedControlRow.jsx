/**
 * UNIFIED CONTROL ROW — Single Compact Control Bar
 * 
 * [ Status ] | [ Mode Tabs ] | [ Horizon Tabs ]
 * 
 * No multi-level structure. No big cards. One row.
 */

import React from 'react';
import { getTierColor } from '../../hooks/useFocusPack';

// Horizons config
const HORIZONS = ['7d', '14d', '30d', '90d', '180d', '365d'];

// Mode config
const MODES = [
  { key: 'price', label: 'Price' },
  { key: 'replay', label: 'Replay' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'sum', label: 'SUM', disabled: true },
];

/**
 * Status Badge - compact colored badge
 */
function StatusBadge({ children, variant = 'default' }) {
  const variants = {
    hold: 'bg-amber-100 text-amber-700 border-amber-200',
    buy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sell: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

/**
 * Main Unified Control Row
 */
export function UnifiedControlRow({
  // Status props
  signal = 'HOLD',
  confidence = 'Medium',
  marketMode = 'Accumulation',
  risk = 'Normal',
  
  // Mode props
  chartMode = 'price',
  onModeChange,
  
  // Horizon props
  focus = '30d',
  onFocusChange,
  loading = false,
}) {
  // Determine signal variant
  const signalVariant = signal?.toLowerCase() === 'buy' ? 'buy' 
    : signal?.toLowerCase() === 'sell' ? 'sell' 
    : 'hold';
  
  // Risk color
  const riskColor = risk === 'CRISIS' ? 'text-red-600' 
    : risk === 'HIGH' ? 'text-orange-600'
    : 'text-slate-600';

  return (
    <div 
      className="flex justify-between items-center py-3 px-4 bg-white border-b border-slate-200"
      data-testid="unified-control-row"
    >
      {/* LEFT: Status + Mode */}
      <div className="flex items-center gap-6">
        
        {/* Primary Status - compact inline */}
        <div className="flex items-center gap-3">
          <StatusBadge variant={signalVariant}>{signal}</StatusBadge>
          <span className="text-sm text-slate-500">
            <span className="text-slate-400">Confidence:</span> {confidence}
          </span>
          <span className="text-sm text-slate-600 font-medium">
            {marketMode}
          </span>
          <span className={`text-sm font-medium ${riskColor}`}>
            {risk !== 'Normal' && risk}
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-5 w-px bg-slate-200" />
        
        {/* Mode Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {MODES.map(mode => (
            <button
              key={mode.key}
              onClick={() => !mode.disabled && onModeChange?.(mode.key)}
              disabled={mode.disabled || loading}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${chartMode === mode.key 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : mode.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}
              `}
              data-testid={`mode-${mode.key}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* RIGHT: Horizon Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        {HORIZONS.map(h => {
          const isActive = focus === h;
          const tier = ['7d', '14d'].includes(h) ? 'TIMING' 
            : ['30d', '90d'].includes(h) ? 'TACTICAL' 
            : 'STRUCTURE';
          const tierColor = getTierColor(tier);
          
          return (
            <button
              key={h}
              onClick={() => onFocusChange?.(h)}
              disabled={loading}
              className={`
                relative px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${isActive 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}
                ${loading ? 'opacity-50' : ''}
              `}
              data-testid={`horizon-${h}`}
            >
              {h.toUpperCase()}
              {/* Tier indicator */}
              <div 
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                style={{ backgroundColor: tierColor, opacity: isActive ? 1 : 0.3 }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default UnifiedControlRow;
