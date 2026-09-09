import { ErrorRequestHandler } from 'express';
import { AppError } from '../common/errors';

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  req.log?.error({ err }, 'Request failed');
  const statusCode = err instanceof AppError
    ? err.statusCode
    : err?.status === 400 || err?.type === 'entity.parse.failed'
      ? 400
      : err?.message === 'Origin is not allowed by CORS'
        ? 403
        : 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  res.status(statusCode).json({ status: 'error', code: statusCode, message });
};
