import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import prisma from '../../src/db';
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';

describe('Tenant Isolation and Security', () => {
  let tenantA_id: string;
  let tenantB_id: string;
  let userA_id: string;
  let userA_token: string;
  let userB_token: string;
  let employeeA_id: string;
  let employeeB_id: string;

  beforeAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.compensation.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();

    const tenantA = await prisma.tenant.create({ data: { name: 'Tenant A' } });
    const tenantB = await prisma.tenant.create({ data: { name: 'Tenant B' } });
    tenantA_id = tenantA.id;
    tenantB_id = tenantB.id;

    const passwordHash = await hash('pass', 10);
    const userA = await prisma.user.create({
      data: { tenantId: tenantA_id, email: 'usera@test.com', name: 'A', passwordHash }
    });
    userA_id = userA.id;

    const userB = await prisma.user.create({
      data: { tenantId: tenantB_id, email: 'userb@test.com', name: 'B', passwordHash }
    });

    const secret = process.env.JWT_SECRET || 'supersecret_for_assessment';
    userA_token = jwt.sign({ id: userA.id, tenantId: userA.tenantId, email: userA.email }, secret);
    userB_token = jwt.sign({ id: userB.id, tenantId: userB.tenantId, email: userB.email }, secret);

    const employeeA = await prisma.employee.create({
      data: {
        tenantId: tenantA_id,
        firstName: 'Alice',
        lastName: 'A',
        email: 'alice@a.com',
        department: 'Engineering',
        country: 'USA',
        hireDate: new Date()
      }
    });
    employeeA_id = employeeA.id;

    const employeeB = await prisma.employee.create({
      data: {
        tenantId: tenantB_id,
        firstName: 'Bob',
        lastName: 'B',
        email: 'bob@b.com',
        department: 'Engineering',
        country: 'UK',
        hireDate: new Date()
      }
    });
    employeeB_id = employeeB.id;

    await prisma.compensation.create({
      data: {
        tenantId: tenantB_id,
        employeeId: employeeB_id,
        amount: 80000,
        currency: 'USD',
        effectiveDate: new Date(),
        createdBy: userB.id
      }
    });
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.compensation.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('Rejects missing authentication', async () => {
      const res = await request(app).get(`/api/employees`);
      expect(res.status).toBe(401);
    });

    it('Rejects malformed JWT', async () => {
      const res = await request(app).get(`/api/employees`).set('Authorization', `Bearer foobar`);
      expect(res.status).toBe(401);
    });
  });

  describe('Tenant Isolation', () => {
    it('Tenant A cannot read Tenant B employee', async () => {
      const res = await request(app)
        .get(`/api/employees/${employeeB_id}`)
        .set('Authorization', `Bearer ${userA_token}`);
      expect(res.status).toBe(404);
    });

    it('Tenant A cannot list Tenant B employees', async () => {
      const res = await request(app)
        .get(`/api/employees`)
        .set('Authorization', `Bearer ${userA_token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.every((e: any) => e.id !== employeeB_id)).toBe(true);
    });

    it('Tenant A cannot modify Tenant B compensation', async () => {
      const res = await request(app)
        .post(`/api/employees/${employeeB_id}/compensations`)
        .set('Authorization', `Bearer ${userA_token}`)
        .send({ amount: 50000, currency: 'USD', effectiveDate: '2023-01-01' });
      expect(res.status).toBe(404);
    });

    it('Tenant A cannot access Tenant B compensation history', async () => {
      const res = await request(app)
        .get(`/api/employees/${employeeB_id}/compensations`)
        .set('Authorization', `Bearer ${userA_token}`);
      expect(res.status).toBe(404);
    });

    it('Tenant A analytics isolates Tenant B data', async () => {
      const res = await request(app)
        .get(`/api/analytics/compensation-summary?groupBy=department`)
        .set('Authorization', `Bearer ${userA_token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1); // Tenant A has 1 employee
      expect(res.body.data[0].headcount).toBe(1);
      expect(res.body.data[0].totalPayroll).toBe(0); // No compensation yet before next tests
    });
  });

  describe('Compensation & Audit', () => {
    it('Rolls back transaction when audit creation fails', async () => {
      const compCountBefore = await prisma.compensation.count({ where: { employeeId: employeeA_id } });
      
      const tooLongReason = 'a'.repeat(300); // Exceeds VARCHAR(191) limit, forcing Prisma to throw an error on auditLog creation
      
      const res = await request(app)
        .post(`/api/employees/${employeeA_id}/compensations`)
        .set('Authorization', `Bearer ${userA_token}`)
        .send({ amount: 150000, currency: 'USD', effectiveDate: '2024-06-01', reason: tooLongReason });
      
      expect(res.status).toBe(500);

      const compCountAfter = await prisma.compensation.count({ where: { employeeId: employeeA_id } });
      expect(compCountAfter).toBe(compCountBefore); // Should not have created compensation
    });

    it('Creates compensation and audit log atomically', async () => {
      const res = await request(app)
        .post(`/api/employees/${employeeA_id}/compensations`)
        .set('Authorization', `Bearer ${userA_token}`)
        .send({ amount: 90000, currency: 'USD', effectiveDate: '2024-01-01', reason: 'Promotion' });
      
      expect(res.status).toBe(201);
      
      const comp = await prisma.compensation.findFirst({ where: { employeeId: employeeA_id } });
      expect(comp).toBeDefined();

      const audit = await prisma.auditLog.findFirst({ where: { employeeId: employeeA_id } });
      expect(audit).toBeDefined();
      expect(audit?.tenantId).toBe(tenantA_id);
      expect(audit?.actorId).toBe(userA_id);
      expect(audit?.action).toBe('SALARY_UPDATE');
    });
  });
});
