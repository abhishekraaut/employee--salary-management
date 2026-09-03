import { RequestHandler } from 'express';

export const notFoundMiddleware: RequestHandler = (_req, res) => {
  res.status(404).json({ status: 'error', code: 404, message: 'Route not found' });
};
