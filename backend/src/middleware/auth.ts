import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'supersecret_for_assessment';
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      email: decoded.email
    };
    next();
  } catch (err) {
    if (req.log) {
      req.log.warn({ err }, 'JWT Verification failed');
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
};
