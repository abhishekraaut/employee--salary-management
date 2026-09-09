import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../common/errors';
import { getAuthenticatedUser, verifyToken } from '../services/auth.service';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', code: 401, message: 'Unauthorized' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return res.status(401).json({ status: 'error', code: 401, message: 'Unauthorized' });
  try {
    req.user = await getAuthenticatedUser(verifyToken(token));
    next();
  } catch (err) {
    req.log!.warn({ err }, 'JWT Verification failed');
    if (err instanceof UnauthorizedError) return res.status(401).json({ status: 'error', code: 401, message: err.message });
    next(err);
  }
};
