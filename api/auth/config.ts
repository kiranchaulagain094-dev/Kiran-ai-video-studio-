import { isGoogleOAuthConfigured } from '../../server/auth';
import { isDbConfigured } from '../../server/db';

export default async function handler(req: any, res: any) {
  const googleOk = isGoogleOAuthConfigured();
  const dbOk = isDbConfigured();

  const data = {
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
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(data);
  }
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}
