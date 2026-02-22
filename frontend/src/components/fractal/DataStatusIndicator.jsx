/**
 * BLOCK U3 — Data Status Indicator
 * 
 * Shows whether data is REAL (from backend calculation) or FALLBACK (cached/mock)
 */

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Database } from 'lucide-react';

export function DataStatusIndicator({ 
  status = 'unknown', // 'real' | 'fallback' | 'error' | 'loading'
  reason,
  meta,
  matchesCount = 0,
  coverage,
  quality
}) {
  // Determine status from data
  let computedStatus = status;
  let computedReason = reason;
  
  if (status === 'unknown' && meta) {
    // Auto-detect status from metadata
    if (matchesCount > 0 && meta.focus) {
      computedStatus = 'real';
      computedReason = `${matchesCount} matches found`;
    } else if (matchesCount === 0) {
      computedStatus = 'fallback';
      computedReason = 'No matches found';
    }
  }
  
  // Add quality/coverage info
  if (quality !== undefined && quality < 0.5) {
    computedStatus = 'fallback';
    computedReason = `Low quality (${(quality * 100).toFixed(0)}%)`;
  }
  
  const configs = {
    real: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'REAL',
    },
    fallback: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'FALLBACK',
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'ERROR',
    },
    loading: {
      icon: Database,
      color: 'text-slate-400',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      label: 'LOADING',
    },
    unknown: {
      icon: Database,
      color: 'text-slate-400',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      label: 'UNKNOWN',
    },
  };
  
  const config = configs[computedStatus] || configs.unknown;
  const Icon = config.icon;
  
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium ${config.bg} ${config.border} ${config.color}`}
      title={computedReason || 'Data status'}
      data-testid="data-status-indicator"
    >
      <Icon className="w-3 h-3" />
      <span>DATA: {config.label}</span>
      {computedReason && (
        <span className="text-[10px] opacity-70">({computedReason})</span>
      )}
    </div>
  );
}

export default DataStatusIndicator;
