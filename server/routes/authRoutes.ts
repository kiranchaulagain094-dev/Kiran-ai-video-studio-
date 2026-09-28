import express from 'express';
import type { Request, Response } from 'express';
import { 
  isGoogleOAuthConfigured, 
  getGoogleAuthorizationUrl, 
  getGoogleRedirectUri, 
  exchangeGoogleCodeForUser, 
  findOrCreateGoogleUser, 
  createUserSession, 
  setSessionCookie, 
  clearSessionCookie, 
  revokeSession 
} from '../auth.ts';
import { isDbConfigured } from '../db.ts';

const router = express.Router();

/**
 * GET /api/auth/config
 * Returns whether Google OAuth and Neon DB are configured
 */
router.get(['/config', '/auth/config', '/api/auth/config'], (req: Request, res: Response) => {
  try {
    const googleOk = isGoogleOAuthConfigured();
    const dbOk = isDbConfigured();

    res.json({
      success: true,
      isConfigured: googleOk && dbOk,
      googleOAuth: googleOk,
      database: dbOk,
      configuredEnvVars: {
        hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
        hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasSessionSecret: Boolean(process.env.SESSION_SECRET),
        hasAppUrl: Boolean(process.env.APP_URL)
      }
    });
  } catch (err: any) {
    res.status(200).json({
      success: false,
      isConfigured: false,
      googleOAuth: false,
      database: false,
      error: err?.message || 'Configuration probe error'
    });
  }
});

/**
 * GET /api/auth/google
 * Initiates the Google OAuth 2.0 authorization code flow
 */
router.get(['/google', '/auth/google', '/api/auth/google'], (req: Request, res: Response) => {
  try {
    const missing: string[] = [];
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.trim().length === 0) {
      missing.push('GOOGLE_CLIENT_ID');
    }
    if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET.trim().length === 0) {
      missing.push('GOOGLE_CLIENT_SECRET');
    }
    if (!isDbConfigured()) {
      missing.push('DATABASE_URL');
    }

    if (missing.length > 0) {
      const errorMsg = `Google OAuth is not configured. Missing required environment variable(s): ${missing.join(', ')}. Please configure them in your Vercel project settings.`;
      console.warn('[Google OAuth Config Error]:', errorMsg);
      
      const wantsJson = req.headers.accept?.includes('application/json') || req.xhr;
      if (wantsJson) {
        return res.status(503).json({ success: false, error: errorMsg });
      }
      return res.redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
    }

    const state = (req.query.state as string) || undefined;
    const authUrl = getGoogleAuthorizationUrl(req, state);
    res.redirect(authUrl);
  } catch (err: any) {
    console.error('Failed to initiate Google OAuth:', err);
    const message = err?.message || 'Failed to initiate Google OAuth authorization flow.';
    const wantsJson = req.headers.accept?.includes('application/json') || req.xhr;
    if (wantsJson) {
      return res.status(500).json({ success: false, error: message });
    }
    res.redirect(`/?auth_error=${encodeURIComponent(message)}`);
  }
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth redirect, exchanges code, creates user and session
 */
router.get(['/google/callback', '/auth/google/callback', '/api/auth/google/callback'], async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query;

  if (error) {
    const errorMsg = (error_description as string) || (error as string) || 'Authentication cancelled by user';
    console.warn('Google OAuth error callback:', errorMsg);
    return res.redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/?auth_error=missing_authorization_code');
  }

  // Validate server configuration before attempting code exchange
  const missing: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!isDbConfigured()) missing.push('DATABASE_URL');

  if (missing.length > 0) {
    const errorMsg = `Server configuration error: missing ${missing.join(', ')} in environment variables.`;
    return res.redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const redirectUri = getGoogleRedirectUri(req);
    const profile = await exchangeGoogleCodeForUser(code, redirectUri);
    const user = await findOrCreateGoogleUser(profile);
    const session = await createUserSession(user.id, req);
    setSessionCookie(res, session.cookieValue, req);

    res.redirect('/?auth_success=1');
  } catch (err: any) {
    console.error('Google OAuth callback processing error:', err);
    const message = err?.message || 'Authentication error. Please try again.';
    res.redirect(`/?auth_error=${encodeURIComponent(message)}`);
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user or null
 */
router.get(['/me', '/auth/me', '/api/auth/me'], (req: Request, res: Response) => {
  try {
    if (req.user) {
      res.json({
        success: true,
        authenticated: true,
        user: req.user
      });
    } else {
      res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }
  } catch (err: any) {
    res.json({
      success: true,
      authenticated: false,
      user: null
    });
  }
});

/**
 * POST /api/auth/logout
 * Terminates session in Neon and clears session cookie
 */
router.post(['/logout', '/auth/logout', '/api/auth/logout'], async (req: Request, res: Response) => {
  try {
    if (req.sessionId) {
      await revokeSession(req.sessionId);
    }
    clearSessionCookie(res, req);
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err: any) {
    console.warn('Logout warning:', err);
    clearSessionCookie(res, req);
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
});

export default router;
