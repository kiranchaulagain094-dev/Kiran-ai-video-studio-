import { 
  getGoogleRedirectUri, 
  exchangeGoogleCodeForUser, 
  findOrCreateGoogleUser, 
  createUserSession, 
  setSessionCookie 
} from '../../../server/auth.ts';
import { isDbConfigured } from '../../../server/db.ts';

export default async function handler(req: any, res: any) {
  const code = req.query?.code;
  const error = req.query?.error;
  const errorDescription = req.query?.error_description;

  if (error) {
    const errorMsg = (errorDescription as string) || (error as string) || 'Authentication cancelled by user';
    console.warn('Google OAuth callback error:', errorMsg);
    res.statusCode = 302;
    res.setHeader('Location', `/?auth_error=${encodeURIComponent(errorMsg)}`);
    return res.end();
  }

  if (!code || typeof code !== 'string') {
    res.statusCode = 302;
    res.setHeader('Location', '/?auth_error=missing_authorization_code');
    return res.end();
  }

  // Validate server configuration before attempting code exchange
  const missing: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!isDbConfigured()) missing.push('DATABASE_URL');

  if (missing.length > 0) {
    const errorMsg = `Server configuration error: missing ${missing.join(', ')} in Vercel environment variables.`;
    res.statusCode = 302;
    res.setHeader('Location', `/?auth_error=${encodeURIComponent(errorMsg)}`);
    return res.end();
  }

  try {
    const redirectUri = getGoogleRedirectUri(req);
    const profile = await exchangeGoogleCodeForUser(code, redirectUri);
    const user = await findOrCreateGoogleUser(profile);
    const session = await createUserSession(user.id, req);
    setSessionCookie(res, session.cookieValue, req);

    res.statusCode = 302;
    res.setHeader('Location', '/?auth_success=1');
    res.end();
  } catch (err: any) {
    console.error('Google OAuth callback processing error:', err);
    const message = err?.message || 'Authentication error. Please try again.';
    res.statusCode = 302;
    res.setHeader('Location', `/?auth_error=${encodeURIComponent(message)}`);
    res.end();
  }
}
