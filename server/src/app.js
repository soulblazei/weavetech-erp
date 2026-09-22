import express from 'express';
import cors from 'cors';
import masterRoutes from './routes/masterRoutes.js';
import productionRoutes from './routes/productionRoutes.js';

export const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'WEAVE-TECH ERP API Server',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/masters', masterRoutes);
app.use('/api/production', productionRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.url}`,
    message: 'Endpoint not found'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
});

export default app;
