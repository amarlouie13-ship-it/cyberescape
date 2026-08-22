import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

export const createApp = () => {
  const app = express();

  const allowedOrigins = new Set(
    String(process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
        if (allowedOrigins.has(origin) || localhostPattern.test(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'cyberescape-api' });
  });

  app.use('/api', routes);

  app.use((error, _req, res, _next) => {
    // Keep API failures JSON-shaped so the frontend can display useful messages.
    // eslint-disable-next-line no-console
    console.error('[api:error]', error?.message, error?.code ?? '', error?.status ?? '');
    const status = Number.isInteger(error?.status) && error.status >= 400 ? error.status : 500;
    res.status(status).json({
      message: error?.message || 'Unexpected backend error.',
      code: error?.code || 'internal_error',
    });
  });

  return app;
};
