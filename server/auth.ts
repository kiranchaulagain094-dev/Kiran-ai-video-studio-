import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseService, DbUser } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'kiran-studio-custom-session-sec-948123048';
const COOKIE_NAME = 'studio_session';
const TOKEN_EXPIRY = '7d';

export interface AuthenticatedRequest extends Request {
  user?: DbUser;
  userId?: string;
}

export class AuthService {
  /**
   * Hashes password using bcrypt with 12 salt rounds.
   * Plaintext passwords are NEVER stored.
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verifies plaintext password against stored bcrypt hash.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Signs a secure session token.
   */
  static createToken(user: DbUser): string {
    return jwt.sign(
      {
        sub: user.id, // Subject = unique immutable user ID
        username: user.username,
        role: user.role
      },
      SESSION_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
  }

  /**
   * Verifies and decodes a session token.
   */
  static verifyToken(token: string): { sub: string; username: string; role: string } | null {
    try {
      const decoded = jwt.verify(token, SESSION_SECRET) as any;
      if (decoded && decoded.sub) {
        return decoded;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Sets secure HttpOnly cookie on response.
   */
  static setSessionCookie(res: Response, token: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // Support iframe previews and cross-origin safely
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
  }

  /**
   * Clears session cookie.
   */
  static clearSessionCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });
  }

  /**
   * Extracts token from cookie or Authorization Bearer header.
   */
  static extractToken(req: Request): string | null {
    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      return req.cookies[COOKIE_NAME];
    }
    // 2. Check signed Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split('Bearer ')[1].trim();
    }
    return null;
  }
}

/**
 * Express middleware to strictly enforce authenticated sessions.
 * Guarantees that req.userId is always server-verified and never client-forged.
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = AuthService.extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded || !decoded.sub) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  try {
    // Verify that the user exists in database and is active
    const user = await DatabaseService.findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact admin.' });
    }

    req.user = user;
    req.userId = user.id; // Immutable unique identifier
    next();
  } catch (err: any) {
    return res.status(500).json({ error: 'Authentication verification failed.' });
  }
};

/**
 * Express middleware to restrict access to administrator users.
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
    }
    next();
  });
};
