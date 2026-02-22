/**
 * UNIFIED LIFECYCLE ROUTES
 * 
 * BLOCK L1 — API endpoints for lifecycle management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { getUnifiedLifecycleService } from './lifecycle.service.js';
import { ModelId, LifecycleStatus } from './lifecycle.types.js';

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

export async function registerLifecycleRoutes(app: FastifyInstance): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    console.error('[Lifecycle] MongoDB not connected');
    return;
  }
  
  const service = getUnifiedLifecycleService(db);
  
  await service.ensureIndexes();
  
  // ═══════════════════════════════════════════════════════════════
  // STATUS ENDPOINTS
  // ═══════════════════════════════════════════════════════════════
  
  // GET /api/lifecycle/:modelId/status
  app.get<{
    Params: { modelId: ModelId };
  }>('/api/lifecycle/:modelId/status', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const state = await service.getState(modelId);
      
      if (!state) {
        return reply.code(404).send({
          ok: false,
          error: `Model ${modelId} not found in lifecycle`,
        });
      }
      
      return { ok: true, data: state };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // GET /api/lifecycle/all
  app.get('/api/lifecycle/all', async (req, reply) => {
    try {
      const states = await service.getAllStates();
      return { ok: true, data: states };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // GET /api/lifecycle/combined-readiness
  app.get('/api/lifecycle/combined-readiness', async (req, reply) => {
    try {
      const result = await service.getCombinedReadiness();
      return { ok: true, data: result };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TRANSITION ENDPOINTS
  // ═══════════════════════════════════════════════════════════════
  
  // POST /api/lifecycle/:modelId/propose
  app.post<{
    Params: { modelId: ModelId };
  }>('/api/lifecycle/:modelId/propose', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const result = await service.transition(modelId, 'PROPOSED', 'WARMUP_START', 'ADMIN');
      
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: result.error });
      }
      
      return { ok: true, data: result.state };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // POST /api/lifecycle/:modelId/start-warmup
  app.post<{
    Params: { modelId: ModelId };
  }>('/api/lifecycle/:modelId/start-warmup', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const result = await service.startWarmup(modelId);
      
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: result.error });
      }
      
      const state = await service.getState(modelId);
      return { ok: true, data: state };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // POST /api/lifecycle/:modelId/force-apply
  app.post<{
    Params: { modelId: ModelId };
    Body: { note?: string };
  }>('/api/lifecycle/:modelId/force-apply', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const { note } = req.body || {};
      
      const result = await service.forceApply(modelId, note);
      
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: result.error });
      }
      
      const state = await service.getState(modelId);
      return { ok: true, data: state };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // POST /api/lifecycle/:modelId/force-revoke
  app.post<{
    Params: { modelId: ModelId };
    Body: { note?: string };
  }>('/api/lifecycle/:modelId/force-revoke', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const { note } = req.body || {};
      
      const result = await service.forceRevoke(modelId, note);
      
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: result.error });
      }
      
      const state = await service.getState(modelId);
      return { ok: true, data: state };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════════════════
  // VALIDATION ENDPOINTS
  // ═══════════════════════════════════════════════════════════════
  
  // POST /api/lifecycle/:modelId/validate
  app.post<{
    Params: { modelId: ModelId };
  }>('/api/lifecycle/:modelId/validate', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const result = await service.validateForPromotion(modelId);
      return { ok: true, data: result };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // POST /api/lifecycle/:modelId/check-promote
  app.post<{
    Params: { modelId: ModelId };
  }>('/api/lifecycle/:modelId/check-promote', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const result = await service.checkAndPromote(modelId);
      const state = await service.getState(modelId);
      return { ok: true, data: { ...result, state } };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════════════════
  // EVENTS ENDPOINTS
  // ═══════════════════════════════════════════════════════════════
  
  // GET /api/lifecycle/:modelId/events
  app.get<{
    Params: { modelId: ModelId };
    Querystring: { limit?: string };
  }>('/api/lifecycle/:modelId/events', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const limit = parseInt(req.query.limit || '50', 10);
      
      const events = await service.getRecentEvents(modelId, limit);
      return { ok: true, data: events };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════════════════
  // DEV MODE ENDPOINTS
  // ═══════════════════════════════════════════════════════════════
  
  // POST /api/lifecycle/:modelId/simulate (DEV only)
  app.post<{
    Params: { modelId: ModelId };
    Body: { status: LifecycleStatus };
  }>('/api/lifecycle/:modelId/simulate', async (req, reply) => {
    try {
      const { modelId } = req.params;
      const { status } = req.body;
      
      const state = await service.simulateStatus(modelId, status);
      return { ok: true, data: state };
    } catch (err: any) {
      return reply.code(400).send({ ok: false, error: err.message });
    }
  });
  
  console.log('[Lifecycle] Routes registered at /api/lifecycle/*');
}

export default registerLifecycleRoutes;
