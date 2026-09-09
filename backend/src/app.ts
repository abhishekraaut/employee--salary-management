import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { env } from './config/env';
import { checkDatabase } from './config/database';
import { errorMiddleware } from './middleware/error';
import { notFoundMiddleware } from './middleware/not-found';
import { setupSwagger, swaggerSpec } from './swagger';

import authRouter from './routes/auth';
import employeeRouter from './routes/employees';
import analyticsRouter from './routes/analytics';
import auditRouter from './routes/audit';

const logger = pino({ level: env.LOG_LEVEL });

export const app: Express = express();

// Request IDs
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('x-request-id', req.id);
  next();
});

// Structured logging
app.use(pinoHttp({
  logger,
  genReqId: function (req: any, res: any) {
    return req.id;
  }
}));

const allowedOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS'));
  }
}));
app.use(express.json() as RequestHandler);
setupSwagger(app);

// Health probes
app.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Server is healthy' });
});

app.get('/health/ready', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkDatabase();
    res.status(200).json({ status: 'success', message: 'Database is ready' });
  } catch (error) {
    next(error);
  }
});

app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit', auditRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
