import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { authenticateToken } from './auth';

dotenv.config();

export function createApp() {
  const app = express();
  const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;

  // Basic security and parsing middlewares
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Ensure upload directory exists and serve uploads
  const uploadDir = isVercel
    ? path.resolve('/tmp', 'uploads')
    : path.resolve(process.cwd(), 'uploads');

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not initialize upload directory:', err);
  }

  app.use('/uploads', express.static(uploadDir));

  // Attach auth extraction middleware
  app.use(authenticateToken);

  // Body normalization fallback (prevents destructuring errors if body is undefined)
  app.use((req, _res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
    }
    next();
  });

  // Health and deployment status endpoints
  app.get(['/api/health', '/health'], (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      platform: isVercel ? 'vercel' : 'standard',
    });
  });

  app.get(['/api/system/deployment', '/system/deployment'], (_req, res) => {
    res.json({
      isVercel,
      nodeEnv: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString(),
      databaseStatus: 'connected',
    });
  });

  // Mount API endpoints both at /api and at root for Vercel rewrite compatibility
  app.use('/api', apiRoutes);
  app.use('/', apiRoutes);

  // Handle unmatched API routes with JSON 404 instead of HTML
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
    });
  });

  // Global Error Handler - guarantees structured JSON response instead of HTML 500
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[TechSetu Server Uncaught Exception]:', err);
    const status =
      typeof err.status === 'number'
        ? err.status
        : typeof err.statusCode === 'number'
        ? err.statusCode
        : 500;
    res.status(status).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}

const defaultApp = createApp();
export default defaultApp;
