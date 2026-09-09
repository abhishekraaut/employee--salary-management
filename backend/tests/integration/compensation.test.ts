import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';
import { app } from '../../src/app';
import prisma from '../../src/db';
import { env } from '../../src/config/env';

describe('Compensation, audit, and analytics', () => {
  let tenantId: string;
  let userId: string;
  let token: string;
  let employeeId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({ data: { name: `Compensation Tenant ${Date.now()}` } });
    tenantId = tenant.id;
    const user = await prisma.user.create({
      data: {
        tenantId,
        email: `compensation-${Date.now()}@test.com`,
        name: 'Compensation Test User',
        passwordHash: await hash('password', 10)
      }
    });
    userId = user.id;
    token = jwt.sign({ id: user.id, tenantId, email: user.email }, env.JWT_SECRET);

    const employee = await prisma.employee.create({
      data: {
        tenantId,
        firstName: 'Current',
        lastName: 'Salary',
        email: `employee-${Date.now()}@test.com`,
        department: 'Engineering',
        country: 'USA',
        hireDate: new Date('2020-01-01')
      }
    });
    employeeId = employee.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { tenantId } });
    await prisma.compensation.deleteMany({ where: { tenantId } });
    await prisma.employee.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.$disconnect();
  });

  it('appends compensation and creates an audit record atomically', async () => {
    const response = await request(app)
      .post(`/api/employees/${employeeId}/compensations`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 90000, currency: 'USD', effectiveDate: '2024-01-01', reason: 'Promotion' });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(90000);

    const audit = await prisma.auditLog.findFirst({ where: { tenantId, employeeId } });
    expect(audit).toMatchObject({ action: 'SALARY_UPDATE', actorId: userId, reason: 'Promotion' });
    expect(audit?.newCompensationId).toBe(response.body.id);
  });

  it('ignores future compensation when determining current salary', async () => {
    await prisma.compensation.create({
      data: {
        tenantId,
        employeeId,
        amount: 120000,
        currency: 'USD',
        effectiveDate: new Date(Date.now() + 86400000),
        createdBy: userId
      }
    });

    const response = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({ currentSalary: 90000, currency: 'USD' });
  });

  it('returns tenant-scoped audit history and analytics', async () => {
    const auditResponse = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`);
    const analyticsResponse = await request(app)
      .get('/api/analytics/compensation-summary?groupBy=department')
      .set('Authorization', `Bearer ${token}`);

    expect(auditResponse.status).toBe(200);
    expect(auditResponse.body.data[0]).toMatchObject({ employeeId, actorName: 'Compensation Test User' });
    expect(analyticsResponse.status).toBe(200);
    expect(analyticsResponse.body.data).toContainEqual(expect.objectContaining({
      group: 'Engineering',
      headcount: 1,
      totalPayroll: 90000,
      averageSalary: 90000,
      currency: 'USD'
    }));
  });
});
