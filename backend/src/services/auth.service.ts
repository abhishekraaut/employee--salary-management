import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { UnauthorizedError } from '../common/errors';

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, tenantId: user.tenantId, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'], algorithm: 'HS256' }
  );
  return { token, user: { id: user.id, name: user.name, tenantId: user.tenantId } };
}

export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (!decoded || typeof decoded === 'string') throw new UnauthorizedError();
  const payload = decoded as JwtPayload;
  if (typeof payload.id !== 'string' || typeof payload.tenantId !== 'string' || typeof payload.email !== 'string') {
    throw new UnauthorizedError();
  }
  return { id: payload.id, tenantId: payload.tenantId, email: payload.email };
}
