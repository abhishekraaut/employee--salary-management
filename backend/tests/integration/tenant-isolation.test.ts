import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import prisma from '../../src/db';
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';

describe('Tenant Isolation', () => {
  let tenantAId: string;
  let tenantBId: string;
  let userAToken: string;
  let employeeBId: string;

  beforeAll(async () => {
    const tenantA = await prisma.tenant.create({ data: { name: 'Tenant A' } });
    const tenantB = await prisma.tenant.create({ data: { name: 'Tenant B' } });
    tenantAId = tenantA.id;
    tenantBId = tenantB.id;
    const passwordHash = await hash('pass', 10);
    const userA = await prisma.user.create({
      data: { tenantId: tenantAId, email: 'usera@test.com', name: 'A', passwordHash }
    });
    userAToken = jwt.sign(
      { id: userA.id, tenantId: userA.tenantId, email: userA.email },
      process.env.JWT_SECRET || 'test-secret-that-is-at-least-32-characters-long'
    );
    const employeeB = await prisma.employee.create({
      data: {
        tenantId: tenantBId, firstName: 'Bob', lastName: 'B', email: 'bob@b.com',
        department: 'Engineering', country: 'UK', hireDate: new Date()
      }
    });
    employeeBId = employeeB.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.auditLog.deleteMany(); await prisma.compensation.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  it('hides another tenant employee', async () => {
    const res = await request(app).get(`/api/employees/${employeeBId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(404);
  });

  it('does not list another tenant employees', async () => {
    const res = await request(app).get('/api/employees')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('prevents compensation changes for another tenant', async () => {
    const res = await request(app).post(`/api/employees/${employeeBId}/compensations`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 50000, currency: 'USD', effectiveDate: '2023-01-01' });
    expect(res.status).toBe(404);
  });

  it('hides another tenant audit logs', async () => {
    const userB = await prisma.user.create({
      data: { tenantId: tenantBId, email: 'userb@test.com', name: 'B', passwordHash: 'hash' }
    });
    const userBToken = jwt.sign(
      { id: userB.id, tenantId: tenantBId, email: userB.email },
      process.env.JWT_SECRET || 'test-secret-that-is-at-least-32-characters-long'
    );

    await request(app).post(`/api/employees/${employeeBId}/compensations`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ amount: 50000, currency: 'USD', effectiveDate: '2023-01-01', reason: 'Promotion' });

    const res = await request(app).get('/api/audit')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});