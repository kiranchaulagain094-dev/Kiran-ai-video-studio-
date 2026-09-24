import app from './_app.ts';

export default function handler(req: any, res: any) {
  // Normalize URL when invoked via Vercel dynamic routing [...slug]
  if (req.query && req.query.slug) {
    const slugParts = Array.isArray(req.query.slug) ? req.query.slug : [req.query.slug];
    const pathFromSlug = '/api/' + slugParts.join('/');
    if (!req.url || (!req.url.startsWith('/api/') && !req.url.startsWith('/ai/'))) {
      req.url = pathFromSlug;
    }
  } else if (req.headers && typeof req.headers['x-matched-path'] === 'string') {
    const matched = req.headers['x-matched-path'];
    if (matched.startsWith('/api') && req.url !== matched) {
      req.url = matched;
    }
  }

  return app(req, res);
}

export { app };
