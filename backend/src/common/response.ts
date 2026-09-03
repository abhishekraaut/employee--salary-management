import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message: string, code = 200): void {
  res.status(code).json({ message, status: 'success', code, data });
}
