import { getGoogleAuthorizationUrl } from '../../server/auth';
import { isDbConfigured } from '../../server/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    if (typeof res.setHeader === 'function') res.setHeader('Allow', 'GET');
    return res.status?.(405).json?.({ success: false, error: 'Method Not Allowed' }) || res.end('Method Not Allowed');
  }

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
      const errorMsg = `Google OAuth is not configured. Missing required environment variable(s): ${missing.join(', ')} in Vercel project settings.`;
      console.warn('[Google OAuth Error]:', errorMsg);
      const wantsJson = req.headers?.accept?.includes('application/json');
      if (wantsJson) {
        return res.status(503).json({ success: false, error: errorMsg });
      }
      res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(errorMsg)}` });
      return res.end();
    }

    const state = typeof req.query?.state === 'string' ? req.query.state : undefined;
    const authUrl = getGoogleAuthorizationUrl(req, state);

    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (err: any) {
    console.error('Failed to initiate Google OAuth:', err);
    const message = err?.message || 'Failed to initiate Google OAuth authorization flow.';
    res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(message)}` });
    res.end();
  }
}
