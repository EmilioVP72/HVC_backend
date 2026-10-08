import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  // Security & standard middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Base API routes
  app.use('/api', apiRoutes);

  // 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
