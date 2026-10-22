import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Supabase PostgreSQL Pooler Configuration
// Designed for high-throughput, low-latency factory LAN with transaction-mode pooling
const poolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/weaving_erp',
  // Strict connection limits for Supabase pooling
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  // Connection timeout in milliseconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT || '5000', 10),
  // Idle timeout before releasing client back to pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000', 10),
  // SSL Configuration for Supabase Cloud (disable rejectUnauthorized for pooled self-signed certs if needed)
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
};

export const pool = new Pool(poolConfig);

// Pool Event Listeners for Operational Telemetry
pool.on('connect', (client) => {
  // Set statement timeout per session (15s max query budget)
  client.query('SET statement_timeout = 15000').catch((err) => {
    console.error('Failed to set statement_timeout on client connect:', err.message);
  });
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client pooler:', err);
});

/**
 * Execute a query with automatic client acquisition and release
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
      console.log(`[SQL Query] duration=${duration}ms rows=${res.rowCount} text="${text.slice(0, 100)}..."`);
    }
    return res;
  } catch (err) {
    console.error(`[SQL Error] text="${text.slice(0, 100)}..." error="${err.message}"`);
    throw err;
  }
}

/**
 * Acquire a dedicated client for multi-statement transactions (BEGIN / COMMIT / ROLLBACK)
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

export default pool;
