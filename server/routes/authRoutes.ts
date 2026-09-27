import express, { Request, Response } from 'express';
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
} from '../auth';
import { isDbConfigured } from '../db';

const router = express.Router();

/**
 * GET /api/auth/config
 * Returns whether Google OAuth and Neon DB are configured
 */
router.get(['/config', '/api/auth/config'], (req: Request, res: Response) => {
  res.json({
    success: true,
    isConfigured: isGoogleOAuthConfigured() && isDbConfigured(),
    googleOAuth: isGoogleOAuthConfigured(),
    database: isDbConfigured()
  });
});

/**
 * GET /api/auth/google
 * Initiates the Google OAuth 2.0 authorization code flow
 */
router.get(['/google', '/api/auth/google'], (req: Request, res: Response) => {
  try {
    if (!isGoogleOAuthConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) are not configured in Vercel environment variables. Please configure them in the Vercel Dashboard.'
      });
    }

    const state = req.query.state as string || undefined;
    const authUrl = getGoogleAuthorizationUrl(req, state);
    res.redirect(authUrl);
  } catch (err: any) {
    console.error('Failed to initiate Google OAuth:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to initiate Google OAuth authorization flow.'
    });
  }
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth redirect, exchanges code, creates user and session
 */
router.get(['/google/callback', '/api/auth/google/callback'], async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query;

  if (error) {
    const errorMsg = (error_description as string) || (error as string) || 'Authentication cancelled by user';
    console.warn('Google OAuth error callback:', errorMsg);
    return res.redirect(`/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/?auth_error=missing_authorization_code');
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
router.get(['/me', '/api/auth/me'], (req: Request, res: Response) => {
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
});

/**
 * POST /api/auth/logout
 * Terminates session in Neon and clears session cookie
 */
router.post(['/logout', '/api/auth/logout'], async (req: Request, res: Response) => {
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
    console.error('Logout error:', err);
    clearSessionCookie(res, req);
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
});

export default router;
