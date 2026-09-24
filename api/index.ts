import app from './_app.ts';

export default function handler(req: any, res: any) {
  // If Vercel rewrote the URL, recover original path if available
  if (req.headers && typeof req.headers['x-matched-path'] === 'string') {
    const matched = req.headers['x-matched-path'];
    if (matched.startsWith('/api')) {
      const query = req.url && req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      req.url = matched.includes('?') ? matched : matched + query;
    }
  }
  return app(req, res);
}

export { app };
