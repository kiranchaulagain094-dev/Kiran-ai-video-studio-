import app from './api/_app.ts';
import express from 'express';
import path from 'path';

const PORT = 3000;

// Vite Middleware Setup for Dev & Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kiran AI Video Studio server running on http://0.0.0.0:${PORT}`);
  });
}

// Auto-start server in standalone Node or Cloud Run container
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
