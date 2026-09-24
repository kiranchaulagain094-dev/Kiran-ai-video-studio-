import app from './_app.ts';

export default function handler(req: any, res: any) {
  // If Vercel rewrote the URL, recover original path if available
  if (req.headers && typeof req.headers['x-matched-path'] === 'string') {
    const matched = req.headers['x-matched-path'];
    if (matched.startsWith('/api') && req.url !== matched) {
      req.url = matched;
    }
  }
  return app(req, res);
}

export { app };
