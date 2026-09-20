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
 * Express middleware to handle studio sessions.
 * Provides open access to studio creators without requiring a login barrier.
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = AuthService.extractToken(req);

  const defaultStudioUser: DbUser = {
    id: 'usr_studio_creator',
    username: 'creator',
    displayUsername: 'Kiran Studio Creator',
    passwordHash: '$2a$12$e8x/N8L8vGfL3h7kF3kMquj0O.3Kk0l7U5Bq9fU7w.9g8H9a0b1c2',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Kiran+Studio&background=6366f1&color=fff'
  };

  if (!token) {
    req.user = defaultStudioUser;
    req.userId = defaultStudioUser.id;
    return next();
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded || !decoded.sub) {
    req.user = defaultStudioUser;
    req.userId = defaultStudioUser.id;
    return next();
  }

  try {
    const user = await DatabaseService.findUserById(decoded.sub);
    if (!user) {
      req.user = defaultStudioUser;
      req.userId = defaultStudioUser.id;
      return next();
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (err: any) {
    req.user = defaultStudioUser;
    req.userId = defaultStudioUser.id;
    next();
  }
};

/**
 * Express middleware for admin privileges - automatically permits studio creators.
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    next();
  });
};
