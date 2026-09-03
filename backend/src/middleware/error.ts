import { ErrorRequestHandler } from 'express';
import { AppError } from '../common/errors';

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  req.log.error({ err }, 'Request failed');
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  res.status(statusCode).json({ status: 'error', code: statusCode, message });
};
