import { revokeSession, clearSessionCookie, extractSessionCredentials } from '../../server/auth';

export default async function handler(req: any, res: any) {
  try {
    const creds = extractSessionCredentials(req);
    if (creds?.sessionId) {
      await revokeSession(creds.sessionId);
    }
    clearSessionCookie(res, req);
    if (typeof res.status === 'function') {
      return res.status(200).json({ success: true, message: 'Logged out successfully.' });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, message: 'Logged out successfully.' }));
  } catch (err) {
    clearSessionCookie(res, req);
    if (typeof res.status === 'function') {
      return res.status(200).json({ success: true, message: 'Logged out successfully.' });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, message: 'Logged out successfully.' }));
  }
}
