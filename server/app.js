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

  return app;
};
