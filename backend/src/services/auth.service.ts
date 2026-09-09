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

  const expiresIn = /^\d+$/.test(env.JWT_EXPIRES_IN)
    ? Number(env.JWT_EXPIRES_IN)
    : env.JWT_EXPIRES_IN;
  const token = jwt.sign(
    { id: user.id, tenantId: user.tenantId, email: user.email },
    env.JWT_SECRET,
    { expiresIn: expiresIn as SignOptions['expiresIn'], algorithm: 'HS256' }
  );
  return { token, user: { id: user.id, name: user.name, tenantId: user.tenantId } };
}

export function verifyToken(token: string): AuthUser {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new UnauthorizedError();
  }
  if (!decoded || typeof decoded === 'string') throw new UnauthorizedError();
  const payload = decoded as JwtPayload;
  if (typeof payload.id !== 'string' || typeof payload.tenantId !== 'string' || typeof payload.email !== 'string') {
    throw new UnauthorizedError();
  }
  return { id: payload.id, tenantId: payload.tenantId, email: payload.email };
}

export async function getAuthenticatedUser(user: AuthUser): Promise<AuthUser> {
  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, tenantId: true, email: true }
  });

  if (!databaseUser || databaseUser.tenantId !== user.tenantId || databaseUser.email !== user.email) {
    throw new UnauthorizedError();
  }

  return databaseUser;
}
