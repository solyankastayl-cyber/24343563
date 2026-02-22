/**
 * UNIFIED LIFECYCLE MODULE
 * 
 * BLOCK L1 — Exports for lifecycle engine
 */

export * from './lifecycle.types.js';
export * from './lifecycle.service.js';
export { default as registerLifecycleRoutes } from './lifecycle.routes.js';

console.log('[Lifecycle] Module loaded');
