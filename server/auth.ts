import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { query, isDbConfigured } from './db';

export interface AuthUser {
  id: string;
  username: string;
  display_username: string;
  email: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar: string | null;
  auth_provider?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionToken?: string;
      sessionId?: string;
    }
  }
}

const COOKIE_NAME = 'kiran_session';
const SESSION_DURATION_DAYS = 30;

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'kiran-studio-default-jwt-secret-key-prod-2026';
}

export function getBaseUrl(req: Request): string {
  if (process.env.APP_URL && process.env.APP_URL.trim().length > 0) {
    return process.env.APP_URL.trim().replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

export function getGoogleRedirectUri(req: Request): string {
  return `${getBaseUrl(req)}/api/auth/google/callback`;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
    process.env.GOOGLE_CLIENT_SECRET.trim().length > 0
  );
}

/**
 * Generate Google OAuth 2.0 authorization URL
 */
export function getGoogleAuthorizationUrl(req: Request, state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables.');
  }

  const redirectUri = getGoogleRedirectUri(req);
  const csrfState = state || crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state: csrfState
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange Authorization Code for Google Tokens & User Profile
 */
export async function exchangeGoogleCodeForUser(code: string, redirectUri: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing.');
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!tokenRes.ok) {
    const errorData = await tokenRes.text();
    console.error('Google token exchange failed:', errorData);
    throw new Error(`Google token exchange error: ${tokenRes.status}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error('No access token returned from Google OAuth.');
  }

  // 2. Fetch User Profile
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!profileRes.ok) {
    throw new Error('Failed to retrieve user profile from Google.');
  }

  return await profileRes.json();
}

/**
 * Find or create user in Neon PostgreSQL from Google OAuth profile
 */
export async function findOrCreateGoogleUser(profile: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<AuthUser> {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured. DATABASE_URL is required to persist users.');
  }

  // 1. Check if user already exists by Google provider_user_id or email
  const existing = await query<any>(
    `SELECT id, username, display_username, email, role, status, avatar, auth_provider 
     FROM users 
     WHERE (auth_provider = 'google' AND provider_user_id = $1)
        OR (email IS NOT NULL AND LOWER(email) = LOWER($2))
     LIMIT 1`,
    [profile.sub, profile.email]
  );

  if (existing.length > 0) {
    const user = existing[0];
    
    // Update avatar or display name if changed
    if (profile.picture && profile.picture !== user.avatar) {
      await query(
        `UPDATE users 
         SET avatar = $1, display_username = COALESCE(display_username, $2), auth_provider = 'google', provider_user_id = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4`,
        [profile.picture, profile.name || user.display_username, profile.sub, user.id]
      );
      user.avatar = profile.picture;
    }

    return {
      id: user.id,
      username: user.username,
      display_username: user.display_username,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      auth_provider: user.auth_provider
    };
  }

  // 2. Create new user in Neon
  const newUserId = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const cleanEmail = profile.email.toLowerCase().trim();
  const baseUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'creator';
  const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
  const displayName = profile.name || cleanEmail.split('@')[0];
  const avatar = profile.picture || null;

  // Designate owner as admin if matching admin email
  const isAdmin = cleanEmail === 'kiranchaulagain094@gmail.com';
  const role = isAdmin ? 'admin' : 'user';

  await query(
    `INSERT INTO users (
      id, username, display_username, email, auth_provider, provider_user_id, password_hash, role, status, avatar
    ) VALUES ($1, $2, $3, $4, 'google', $5, NULL, $6, 'active', $7)`,
    [newUserId, uniqueUsername, displayName, cleanEmail, profile.sub, role, avatar]
  );

  return {
    id: newUserId,
    username: uniqueUsername,
    display_username: displayName,
    email: cleanEmail,
    role,
    status: 'active',
    avatar,
    auth_provider: 'google'
  };
}

/**
 * Hash a session token with the session secret
 */
function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token + getSessionSecret()).digest('hex');
}

/**
 * Create a new user session in Neon and generate a signed session cookie
 */
export async function createUserSession(userId: string, req: Request): Promise<{
  sessionId: string;
  token: string;
  cookieValue: string;
  expiresAt: Date;
}> {
  const sessionId = `sess_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(token);
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;
  const userAgent = (req.headers['user-agent'] as string) || null;
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO user_sessions (
      id, user_id, token_hash, ip_address, user_agent, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId, userId, tokenHash, ipAddress, userAgent, expiresAt]
  );

  const cookieValue = `${sessionId}:${token}`;
  return { sessionId, token, cookieValue, expiresAt };
}

/**
 * Set the HttpOnly session cookie on response
 */
export function setSessionCookie(res: Response, cookieValue: string, req: Request): void {
  const isProd = process.env.NODE_ENV === 'production' || !req.hostname.includes('localhost');
  res.cookie(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

/**
 * Clear session cookie on response
 */
export function clearSessionCookie(res: Response, req: Request): void {
  const isProd = process.env.NODE_ENV === 'production' || !req.hostname.includes('localhost');
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/'
  });
}

/**
 * Parse session cookie or Bearer token from incoming request
 */
function extractSessionCredentials(req: Request): { sessionId: string; token: string } | null {
  // 1. Check HttpOnly cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const parts = c.trim().split('=');
        return [parts[0], decodeURIComponent(parts.slice(1).join('='))];
      })
    );
    if (cookies[COOKIE_NAME] && cookies[COOKIE_NAME].includes(':')) {
      const [sessionId, token] = cookies[COOKIE_NAME].split(':');
      if (sessionId && token) return { sessionId, token };
    }
  }

  // 2. Fallback to Authorization: Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const val = authHeader.substring(7).trim();
    if (val.includes(':')) {
      const [sessionId, token] = val.split(':');
      if (sessionId && token) return { sessionId, token };
    }
  }

  return null;
}

/**
 * Validate session against Neon database
 */
export async function validateSession(sessionId: string, token: string): Promise<AuthUser | null> {
  if (!isDbConfigured()) return null;

  try {
    const rows = await query<any>(
      `SELECT s.id AS session_id, s.token_hash, s.expires_at, 
              u.id, u.username, u.display_username, u.email, u.role, u.status, u.avatar, u.auth_provider
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP AND u.status = 'active'
       LIMIT 1`,
      [sessionId]
    );

    if (rows.length === 0) return null;
    const session = rows[0];

    // Verify token hash
    const expectedHash = hashSessionToken(token);
    if (session.token_hash !== expectedHash) {
      return null;
    }

    // Touch last_active_at asynchronously (no await needed)
    query(`UPDATE user_sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1`, [sessionId]).catch(() => {});

    return {
      id: session.id,
      username: session.username,
      display_username: session.display_username,
      email: session.email,
      role: session.role,
      status: session.status,
      avatar: session.avatar,
      auth_provider: session.auth_provider
    };
  } catch (err) {
    console.error('Session validation error in Neon:', err);
    return null;
  }
}

/**
 * Express middleware to attach user to request if session is valid
 */
export async function attachUserMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const credentials = extractSessionCredentials(req);
  if (!credentials) {
    return next();
  }

  try {
    const user = await validateSession(credentials.sessionId, credentials.token);
    if (user) {
      req.user = user;
      req.sessionId = credentials.sessionId;
      req.sessionToken = credentials.token;
    }
  } catch {
    // Non-fatal, proceed as unauthenticated
  }

  next();
}

/**
 * Express middleware to enforce authentication on protected routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with Google to access this feature.'
    });
    return;
  }
  next();
}

/**
 * Revoke session in Neon
 */
export async function revokeSession(sessionId: string): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await query(`DELETE FROM user_sessions WHERE id = $1`, [sessionId]);
  } catch (e) {
    console.error('Failed to revoke session:', e);
  }
}
