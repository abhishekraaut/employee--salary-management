import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';
import { app } from '../../src/app';
import prisma from '../../src/db';
import { env } from '../../src/config/env';

const email = `auth-${Date.now()}@test.com`;
let token: string;
let userId: string;
let tenantId: string;

describe('Authentication', () => {
  beforeAll(async () => {
    const tenant = await prisma.tenant.create({ data: { name: `Auth Tenant ${Date.now()}` } });
    tenantId = tenant.id;
    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        name: 'Authentication Test User',
        passwordHash: await hash('correct-password', 12)
      }
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.$disconnect();
  });

  it('logs in with the correct password and does not expose the hash', async () => {
    const response = await request(app).post('/api/auth/login')
      .send({ email, password: 'correct-password' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user).not.toHaveProperty('passwordHash');
    expect(jwt.verify(response.body.data.token, env.JWT_SECRET)).toMatchObject({ id: userId, tenantId });
    token = response.body.data.token;
  });

  it('rejects an incorrect password and unknown user', async () => {
    const wrongPassword = await request(app).post('/api/auth/login')
      .send({ email, password: 'wrong-password' });
    const unknownUser = await request(app).post('/api/auth/login')
      .send({ email: 'missing@test.com', password: 'correct-password' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownUser.status).toBe(401);
  });

  it('accepts a valid token on protected routes', async () => {
    const response = await request(app).get('/api/employees')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it('rejects missing, malformed, and expired tokens', async () => {
    const expiredToken = jwt.sign({ id: userId, tenantId, email }, env.JWT_SECRET, { expiresIn: -1 });
    const cases = [
      request(app).get('/api/employees'),
      request(app).get('/api/employees').set('Authorization', 'Bearer not-a-jwt'),
      request(app).get('/api/employees').set('Authorization', `Bearer ${expiredToken}`)
    ];

    const responses = await Promise.all(cases);
    expect(responses.every(response => response.status === 401)).toBe(true);
  });
});
