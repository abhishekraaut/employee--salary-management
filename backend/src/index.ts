import { app } from './app';
import { env } from './config/env';
import pino from 'pino';

const logger = pino({ level: env.LOG_LEVEL });
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Server listening');
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down');
  server.close(() => process.exit(0));
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
