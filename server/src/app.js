import express from 'express';
import cors from 'cors';
import masterRoutes from './routes/masterRoutes.js';
import productionRoutes from './routes/productionRoutes.js';
import realtimeRoutes from './routes/realtimeRoutes.js';

export const app = express();

// Lightweight middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Factory LAN Health & Ping Route
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'WEAVE-TECH ERP API Server',
    environment: 'FACTORY_LAN',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/masters', masterRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/realtime', realtimeRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.url}`,
    message: 'API route not found'
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[WEAVE-TECH Error]:', err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
