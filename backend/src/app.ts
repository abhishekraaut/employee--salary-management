import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { IncomingMessage, ServerResponse } from 'http';

import { setupSwagger } from './swagger';
import prisma from './db';
import authRouter from './routes/auth';
import employeeRouter from './routes/employees';
import analyticsRouter from './routes/analytics';
import auditRouter from './routes/audit';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const app = express();

app.use(cors());
app.use(express.json() as RequestHandler);

// Swagger setup
setupSwagger(app);

// Request IDs
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
});

// Structured logging
app.use(pinoHttp({
  logger,
  genReqId: function (req: IncomingMessage, _res: ServerResponse) {
    // Assert req to our extended Request type to safely access 'id'
    return (req as unknown as Request).id || uuidv4();
  }
}) as RequestHandler);

// Health probes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/ready', async (req: Request, res: Response) => {
  try {
    // Verify MySQL connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'READY' });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (req.log) {
        req.log.error({ err }, 'Readiness check failed');
    }
    res.status(503).json({ status: 'UNAVAILABLE' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit', auditRouter);

// Catch-all error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (req.log) {
      req.log.error(err);
  } else {
      console.error(err);
  }
  res.status(500).json({ error: 'Internal Server Error' });
});
