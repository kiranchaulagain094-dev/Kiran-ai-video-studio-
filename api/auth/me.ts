import { validateSession, extractSessionCredentials } from '../../server/auth';

export default async function handler(req: any, res: any) {
  try {
    const creds = extractSessionCredentials(req);
    if (creds) {
      const user = await validateSession(creds.sessionId, creds.token);
      if (user) {
        if (typeof res.status === 'function') {
          return res.status(200).json({ success: true, authenticated: true, user });
        }
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, authenticated: true, user }));
      }
    }

    if (typeof res.status === 'function') {
      return res.status(200).json({ success: true, authenticated: false, user: null });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, authenticated: false, user: null }));
  } catch (err: any) {
    if (typeof res.status === 'function') {
      return res.status(200).json({ success: true, authenticated: false, user: null });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, authenticated: false, user: null }));
  }
}
