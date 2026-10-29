import { app } from './api/index';
import express from 'express';
import path from 'path';
import fs from 'fs';

// Dynamic port binding required for Render, Railway, Cloud Run, and local dev
const PORT = Number(process.env.PORT) || 3000;

// Vite Middleware Setup for Dev & Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (req, res, next) => {
      // Never intercept API, health, or auth routes
      if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/health') ||
        req.path.startsWith('/status') ||
        req.path.startsWith('/auth') ||
        req.path === '/robots.txt' ||
        req.path === '/sitemap.xml'
      ) {
        return next();
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('Kiran AI Video Studio is initializing. Please refresh in a moment.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kiran AI Video Studio running on http://0.0.0.0:${PORT}`);
  });
}

// Auto-start server in standalone Node (Render, Railway, Docker, Local)
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.SERVERLESS
);

if (!isServerless && process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
