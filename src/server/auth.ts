import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'techsetu_super_secret_jwt_key_change_in_production';

export interface AuthRequest extends Request {
  user?: User;
}

export function signToken(user: User): string {
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  } catch (err) {
    console.error('[Auth Error] Failed to generate JWT token:', err);
    throw new Error('Authentication token generation failed');
  }
}

export function hashPassword(plain: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plain, salt);
}

export function comparePassword(plain: string, hash?: string): boolean {
  if (!plain || !hash || typeof hash !== 'string' || typeof plain !== 'string') {
    return false;
  }
  try {
    return bcrypt.compareSync(plain, hash);
  } catch (err) {
    console.error('[Auth Error] bcrypt comparison failed safely:', err);
    return false;
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const userWithHash = db.findUserById(decoded.id);
    if (!userWithHash || userWithHash.status === 'suspended') {
      req.user = undefined;
      return next();
    }
    const { passwordHash: _, ...safeUser } = userWithHash;
    req.user = safeUser as User;
    next();
  } catch (err) {
    req.user = undefined;
    next();
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please login.' });
    return;
  }
  if (req.user.status === 'suspended') {
    res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    return;
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied: Admin privileges required.' });
    return;
  }
  next();
}
