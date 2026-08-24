import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import prisma from '../../src/db';
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';

describe('Tenant Isolation', () => {
  let tenantA_id: string;
  let tenantB_id: string;
  let userA_token: string;
  let employeeB_id: string;

  beforeAll(async () => {
    // Setup 2 tenants
    const tenantA = await prisma.tenant.create({ data: { name: 'Tenant A' } });
    const tenantB = await prisma.tenant.create({ data: { name: 'Tenant B' } });
    tenantA_id = tenantA.id;
    tenantB_id = tenantB.id;

    // Setup user for Tenant A
    const passwordHash = await hash('pass', 10);
    const userA = await prisma.user.create({
      data: { tenantId: tenantA_id, email: 'usera@test.com', name: 'A', passwordHash }
    });

    userA_token = jwt.sign(
      { id: userA.id, tenantId: userA.tenantId, email: userA.email },
      process.env.JWT_SECRET || 'supersecret_for_assessment'
    );

    // Setup employee for Tenant B
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
  });

  afterAll(async () => {
    // Cleanup
    await prisma.compensation.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it('User from Tenant A cannot read Tenant B employees', async () => {
    const res = await request(app)
      .get(`/api/employees/${employeeB_id}`)
      .set('Authorization', `Bearer ${userA_token}`);

    expect(res.status).toBe(404); // Should be completely hidden
  });

  it('User from Tenant A cannot list Tenant B employees', async () => {
    const res = await request(app)
      .get(`/api/employees`)
      .set('Authorization', `Bearer ${userA_token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0); // Should only see Tenant A employees
  });

  it('User from Tenant A cannot add compensation to Tenant B employee', async () => {
    const res = await request(app)
      .post(`/api/employees/${employeeB_id}/compensations`)
      .set('Authorization', `Bearer ${userA_token}`)
      .send({
        amount: 50000,
        currency: 'USD',
        effectiveDate: '2023-01-01'
      });

    expect(res.status).toBe(404);
  });
});
