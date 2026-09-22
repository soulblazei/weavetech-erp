/**
 * WEAVE-TECH Real-Time Synchronization Hub
 * Lightweight WebSocket & SSE Broadcaster optimized for low-end factory LAN devices.
 * Zero polling overhead. Sends minimal delta payloads to preserve client RAM/CPU.
 */

class RealtimeSyncHub {
  constructor() {
    // Registered SSE Client response objects: Set<res>
    this.sseClients = new Set();
    // Registered WebSocket connections: Set<ws>
    this.wsClients = new Set();
    this.heartbeatInterval = null;
  }

  /**
   * Initialize Heartbeat / Ping-Pong to prune dead connections
   */
  init() {
    if (this.heartbeatInterval) return;

    // Send a 30s heartbeat ping to keep LAN NAT and tablet sockets alive
    this.heartbeatInterval = setInterval(() => {
      const pingPayload = JSON.stringify({ type: 'HEARTBEAT', timestamp: Date.now() });

      // Clean dead SSE connections
      for (const res of this.sseClients) {
        try {
          res.write(`data: ${pingPayload}\n\n`);
        } catch {
          this.sseClients.delete(res);
        }
      }

      // Clean dead WebSocket connections
      for (const ws of this.wsClients) {
        try {
          if (ws.readyState === 1 /* OPEN */) {
            ws.send(pingPayload);
          } else {
            this.wsClients.delete(ws);
          }
        } catch {
          this.wsClients.delete(ws);
        }
      }
    }, 30000);
  }

  /**
   * Handle incoming Server-Sent Events (SSE) stream request
   * GET /api/realtime/stream
   */
  handleSSE(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx proxy buffering if present
      'Access-Control-Allow-Origin': '*'
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId: req.ip, time: new Date().toISOString() })}\n\n`);
    this.sseClients.add(res);

    req.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  /**
   * Register a WebSocket client connection
   */
  registerWebSocket(ws, req) {
    this.wsClients.add(ws);

    ws.send(JSON.stringify({
      type: 'CONNECTED',
      protocol: 'WS_WEAVE_TECH_V1',
      clientId: req?.socket?.remoteAddress || 'LAN_CLIENT'
    }));

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });

    ws.on('error', () => {
      this.wsClients.delete(ws);
    });
  }

  /**
   * Broadcast a lightweight delta mutation event to all active factory devices
   * @param {string} eventType - e.g. 'HANDOVER_COMPLETED', 'BATCH_UPDATED', 'GRN_POSTED'
   * @param {object} delta - strictly minimal changed fields only
   */
  broadcast(eventType, delta) {
    const message = JSON.stringify({
      type: eventType,
      delta,
      timestamp: Date.now()
    });

    // 1. Broadcast to SSE clients
    for (const res of this.sseClients) {
      try {
        res.write(`data: ${message}\n\n`);
      } catch {
        this.sseClients.delete(res);
      }
    }

    // 2. Broadcast to WebSocket clients
    for (const ws of this.wsClients) {
      try {
        if (ws.readyState === 1 /* OPEN */) {
          ws.send(message);
        } else {
          this.wsClients.delete(ws);
        }
      } catch {
        this.wsClients.delete(ws);
      }
    }

    if (process.env.DEBUG_REALTIME === 'true') {
      console.log(`[Realtime Broadcast] ${eventType} -> Sent to ${this.sseClients.size} SSE & ${this.wsClients.size} WS clients.`);
    }
  }

  /**
   * Get active connection count
   */
  getStats() {
    return {
      sseClients: this.sseClients.size,
      wsClients: this.wsClients.size,
      totalConnected: this.sseClients.size + this.wsClients.size
    };
  }
}

export const syncHub = new RealtimeSyncHub();
syncHub.init();

export default syncHub;
