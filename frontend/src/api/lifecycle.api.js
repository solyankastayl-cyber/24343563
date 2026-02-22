/**
 * BLOCK L2 — Lifecycle API Client
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

export async function fetchLifecycleState() {
  const response = await fetch(`${API_BASE}/api/lifecycle/state`);
  if (!response.ok) throw new Error('Failed to fetch lifecycle state');
  return response.json();
}

export async function fetchLifecycleEvents(asset = null, limit = 100) {
  const params = new URLSearchParams();
  if (asset) params.set('asset', asset);
  if (limit) params.set('limit', limit.toString());
  
  const url = `${API_BASE}/api/lifecycle/events?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch lifecycle events');
  return response.json();
}

export async function forceWarmup(asset, targetDays = 30) {
  const response = await fetch(`${API_BASE}/api/lifecycle/actions/force-warmup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset, targetDays }),
  });
  return response.json();
}

export async function forceApply(asset, reason) {
  const response = await fetch(`${API_BASE}/api/lifecycle/actions/force-apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset, reason }),
  });
  return response.json();
}

export async function revokeModel(asset, reason) {
  const response = await fetch(`${API_BASE}/api/lifecycle/actions/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset, reason }),
  });
  return response.json();
}

export async function resetSimulation(asset, reason) {
  const response = await fetch(`${API_BASE}/api/lifecycle/actions/reset-simulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset, reason }),
  });
  return response.json();
}

export async function initializeLifecycle() {
  const response = await fetch(`${API_BASE}/api/lifecycle/init`, {
    method: 'POST',
  });
  return response.json();
}
