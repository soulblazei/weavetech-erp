import app from '../server/src/app.js';

/**
 * Vercel Serverless Function Handler
 * Bridges Express.js API routes with Vercel's Node.js Serverless Execution Environment.
 */
export default function handler(req, res) {
  return app(req, res);
}
