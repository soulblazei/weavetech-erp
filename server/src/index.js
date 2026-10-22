import app from './app.js';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '8000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 WEAVE-TECH ERP API Server Running`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`📑 Health: http://${HOST}:${PORT}/health`);
  console.log(`====================================================`);
});

// Graceful Shutdown on termination signals
const shutdown = async (signal) => {
  console.log(`\n[${signal}] Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('PostgreSQL pool drained and closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error draining PostgreSQL pool:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
