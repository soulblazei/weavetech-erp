import { Router } from 'express';
import { syncHub } from '../realtime/syncHub.js';

const router = Router();

/**
 * GET /api/realtime/stream
 * Server-Sent Events (SSE) endpoint for zero-polling real-time updates on LAN
 */
router.get('/stream', (req, res) => {
  syncHub.handleSSE(req, res);
});

/**
 * GET /api/realtime/stats
 * Telemetry endpoint for active connected factory devices
 */
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: syncHub.getStats()
  });
});

export default router;
