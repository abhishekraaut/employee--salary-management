import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const app: Express = express();

app.use(cors());
app.use(express.json());

// Request IDs
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] || uuidv4();
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

// Health probes
app.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/health/ready', (req: Request, res: Response) => {
  // We will add DB check here later
  res.status(200).json({ status: 'READY' });
});

// Catch-all error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  req.log.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});
