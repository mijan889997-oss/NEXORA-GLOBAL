/**
 * NEXVORA GLOBAL - Security & Authorization Layer
 * JWT authentication, password hashing, and role-based access control (RBAC).
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import type { User, UserRole } from '../src/types';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is required for production deployment.');
    }
    return 'nexvora_jwt_secret_dev_key_change_me_before_production_deployment';
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = '7d';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: UserRole;
  username: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export function signUserToken(user: User): string {
  const payload: AuthenticatedUserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    const users = db.getTable('users');
    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User account not found or removed.' });
      return;
    }

    if (user.status === 'banned' || user.status === 'suspended') {
      res.status(403).json({ error: `Account access restricted. Status: ${user.status}. Contact support.` });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function optionalAuthenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
      const users = db.getTable('users');
      const user = users.find((u) => u.id === decoded.id);
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch {}
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized request.' });
      return;
    }

    // SUPER ADMIN possesses universal platform privileges
    if (req.user.role === 'SUPER ADMIN') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' lacks sufficient administrative permissions for this resource.`,
      });
      return;
    }

    next();
  };
}
