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

  return app;
}

const defaultApp = createApp();
export default defaultApp;
