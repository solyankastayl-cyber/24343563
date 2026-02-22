/**
 * SYSTEM STATUS PANEL — Unified State Block
 * UX REFACTOR — Single consolidated panel replacing multiple duplicate info strips
 * 
 * Combines:
 * - Market State (Phase, Consensus, Struct Weight, Divergence)
 * - Projection Context (Focus, Window, Aftermath, Matches, Sample, Coverage, Quality)
 * - Data Status (Real/Fallback, Match count)
 * 
 * NO duplicate strips. All state info in one place.
 */

import React from 'react';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { getTierColor, getTierLabel } from '../../hooks/useFocusPack';
import { SYNC_STATE_CONFIG, DIVERGENCE_GRADE_CONFIG } from '../../hooks/useConsensusPulse';

/**
 * Mini Sparkline for consensus trend
 */
const MiniSparkline = ({ series, width = 80, height = 24 }) => {
  if (!series || series.length === 0) return null;

  const values = series.map(p => p.consensusIndex);
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * (width - 4) + 2;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const first = values[0];
  const last = values[values.length - 1];
  const lineColor = last > first + 2 ? '#16a34a' : last < first - 2 ? '#dc2626' : '#6b7280';

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.5" />
      <circle
        cx={width - 4}
        cy={height - ((last - min) / range) * (height - 6) - 3}
        r="2.5"
        fill={lineColor}
      />
    </svg>
  );
};

/**
 * Single metric row
 */
const MetricRow = ({ label, value, valueColor, hint }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`text-sm font-medium ${valueColor || 'text-slate-800'}`} title={hint}>
      {value}
    </span>
  </div>
);

/**
 * Phase badge with full name
 */
const PhaseBadge = ({ phase }) => {
  const phaseMap = {
    'ACCUMULATION': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Accumulation' },
    'DISTRIBUTION': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Distribution' },
    'MARKUP': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Markup' },
    'MARKDOWN': { bg: 'bg-red-100', text: 'text-red-700', label: 'Markdown' },
    'RECOVERY': { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Recovery' },
    'CAPITULATION': { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Capitulation' },
  };
  
  const config = phaseMap[phase] || { bg: 'bg-slate-100', text: 'text-slate-600', label: phase };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

/**
 * Data status badge
 */
const DataStatusBadge = ({ isReal, matchCount, quality }) => {
  const isRealData = isReal && matchCount > 0 && quality >= 0.5;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      isRealData 
        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
        : 'bg-amber-50 border border-amber-200 text-amber-700'
    }`}>
      {isRealData ? (
        <CheckCircle className="w-3.5 h-3.5" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5" />
      )}
      <span>{isRealData ? 'REAL DATA' : 'FALLBACK'}</span>
    </div>
  );
};

/**
 * Sync state label
 */
const getSyncLabel = (syncState) => {
  const labels = {
    'BULLISH_ALIGNMENT': 'Bullish',
    'BEARISH_ALIGNMENT': 'Bearish', 
    'STRUCTURAL_DOMINANCE': 'Structural',
    'NEUTRAL': 'Neutral',
    'CHAOTIC': 'Chaotic',
  };
  return labels[syncState] || 'Neutral';
};

/**
 * Main System Status Panel
 */
export function SystemStatusPanel({
  // Market State
  phaseSnapshot,
  consensusPulse,
  
  // Projection Context  
  meta,
  diagnostics,
  matchesCount,
  
  // Data Status
  dataStatus = 'real',
  
  className = ''
}) {
  // Extract phase info (API returns 'phase' not 'current')
  const currentPhase = phaseSnapshot?.phase || 'UNKNOWN';
  const phaseStrength = phaseSnapshot?.strengthIndex || phaseSnapshot?.strength || 0;
  
  // Extract consensus data
  const consensusIndex = consensusPulse?.summary?.current || 50;
  const consensusDelta = consensusPulse?.summary?.delta7d || 0;
  const syncState = consensusPulse?.summary?.syncState || 'NEUTRAL';
  const structWeight = consensusPulse?.summary?.avgStructuralWeight || 50;
  
  // Get divergence from last series point
  const lastPulsePoint = consensusPulse?.series?.[consensusPulse.series.length - 1];
  const divergenceGrade = lastPulsePoint?.divergenceGrade || 'C';
  const divergenceScore = lastPulsePoint?.divergenceScore || 50;
  
  // Extract projection context from meta
  const focus = meta?.focus?.toUpperCase() || '30D';
  const tier = meta?.tier || 'TACTICAL';
  const tierColor = getTierColor(tier);
  const window = meta?.windowLen || 60;
  const aftermath = meta?.aftermathDays || 30;
  
  // Extract diagnostics
  const sampleSize = diagnostics?.sampleSize || matchesCount || 0;
  const coverage = diagnostics?.coverageYears || 0;
  const quality = diagnostics?.qualityScore || 0;
  
  // Determine consensus sentiment
  const getConsensusSentiment = (idx) => {
    if (idx >= 70) return { label: 'Bullish', color: 'text-emerald-600' };
    if (idx <= 30) return { label: 'Bearish', color: 'text-red-600' };
    return { label: 'Neutral', color: 'text-slate-600' };
  };
  
  const sentiment = getConsensusSentiment(consensusIndex);

  return (
    <div 
      className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}
      data-testid="system-status-panel"
    >
      <div className="grid grid-cols-3 gap-8">
        
        {/* LEFT — Market State */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" />
            Market State
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-500">Phase</span>
              <PhaseBadge phase={currentPhase} />
            </div>
            
            <MetricRow 
              label="Consensus" 
              value={
                <span className="flex items-center gap-2">
                  <span className="font-bold">{consensusIndex}</span>
                  <span className={sentiment.color}>({sentiment.label})</span>
                  {consensusDelta !== 0 && (
                    <span className={`text-xs ${consensusDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {consensusDelta > 0 ? '+' : ''}{consensusDelta}
                    </span>
                  )}
                </span>
              }
            />
            
            <MetricRow 
              label="Sync State" 
              value={getSyncLabel(syncState)}
              valueColor={
                syncState === 'BULLISH_ALIGNMENT' ? 'text-emerald-600' :
                syncState === 'BEARISH_ALIGNMENT' ? 'text-red-600' :
                'text-slate-600'
              }
            />
            
            <MetricRow 
              label="Structure Weight" 
              value={`${structWeight}%`}
              hint="Structural influence on consensus"
            />
            
            <MetricRow 
              label="Divergence" 
              value={
                <span className="flex items-center gap-1">
                  <span className={`font-semibold ${
                    divergenceGrade === 'A' ? 'text-emerald-600' :
                    divergenceGrade === 'B' ? 'text-green-600' :
                    divergenceGrade === 'C' ? 'text-amber-600' :
                    divergenceGrade === 'D' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>{divergenceGrade}</span>
                  <span className="text-slate-400 text-xs">({divergenceScore})</span>
                </span>
              }
              hint="Model-Replay divergence grade"
            />
            
            {/* Mini sparkline for consensus trend */}
            {consensusPulse?.series && (
              <div className="pt-2 mt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">7-day trend</span>
                  <MiniSparkline series={consensusPulse.series} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER — Projection Context */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            Projection Context
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-500">Focus</span>
              <span className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: tierColor }}
                />
                <span className="text-sm font-semibold text-slate-800">{focus}</span>
                <span className="text-xs text-slate-400">({getTierLabel(tier)})</span>
              </span>
            </div>
            
            <MetricRow label="Window" value={`${window}d`} hint="Lookback window for pattern matching" />
            <MetricRow label="Aftermath" value={`${aftermath}d`} hint="Projection horizon" />
            
            <div className="w-full h-px bg-slate-100 my-1" />
            
            <MetricRow 
              label="Matches" 
              value={matchesCount || 0}
              hint="Historical matches found"
            />
            <MetricRow 
              label="Sample" 
              value={sampleSize}
              hint="Sample size for analysis"
            />
            <MetricRow 
              label="Coverage" 
              value={coverage > 0 ? `${coverage.toFixed(1)}y` : '—'}
              hint="Historical data coverage"
            />
            <MetricRow 
              label="Quality" 
              value={
                <span className={`font-semibold ${
                  quality >= 0.8 ? 'text-emerald-600' :
                  quality >= 0.6 ? 'text-green-600' :
                  quality >= 0.4 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {(quality * 100).toFixed(0)}%
                </span>
              }
              hint="Overall data quality score"
            />
          </div>
        </div>

        {/* RIGHT — Data Status */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            Data Status
          </h4>
          
          <div className="space-y-3">
            <DataStatusBadge 
              isReal={dataStatus !== 'error' && dataStatus !== 'fallback'} 
              matchCount={matchesCount}
              quality={quality}
            />
            
            <div className="text-sm text-slate-600">
              <span className="font-medium">{matchesCount || 0}</span> historical matches available
            </div>
            
            {quality > 0 && (
              <div className="text-xs text-slate-500">
                {quality >= 0.7 
                  ? 'High confidence analysis'
                  : quality >= 0.5 
                    ? 'Moderate confidence analysis'
                    : 'Limited data - lower confidence'
                }
              </div>
            )}
            
            {/* Tier explanation */}
            <div className="pt-3 mt-3 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">
                Horizon Type
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTierColor('TIMING') }} />
                  <span>Timing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTierColor('TACTICAL') }} />
                  <span>Tactical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTierColor('STRUCTURE') }} />
                  <span>Structure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default SystemStatusPanel;
