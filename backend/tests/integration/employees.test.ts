import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import prisma from '../../src/db';
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';

describe('Employees API', () => {
  let tenantId: string;
  let userToken: string;

  beforeAll(async () => {
    await prisma.compensation.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();

    const tenant = await prisma.tenant.create({ data: { name: 'Tenant' } });
    tenantId = tenant.id;

    const user = await prisma.user.create({
      data: { tenantId, email: 'user@test.com', name: 'User', passwordHash: await hash('pass', 10) }
    });

    userToken = jwt.sign({ id: user.id, tenantId, email: user.email }, process.env.JWT_SECRET || 'supersecret_for_assessment');

    await prisma.employee.createMany({
      data: [
        { tenantId, firstName: 'Alice', lastName: 'Zane', email: 'alice@test.com', department: 'Engineering', country: 'USA', hireDate: new Date('2021-01-01'), createdAt: new Date('2024-01-01') },
        { tenantId, firstName: 'Bob', lastName: 'Yates', email: 'bob@test.com', department: 'Sales', country: 'UK', hireDate: new Date('2022-01-01'), createdAt: new Date('2024-01-02') },
        { tenantId, firstName: 'Charlie', lastName: 'Xavier', email: 'charlie@test.com', department: 'Engineering', country: 'Canada', hireDate: new Date('2023-01-01'), createdAt: new Date('2024-01-03') }
      ]
    });
  });

  afterAll(async () => {
    await prisma.compensation.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  });

  describe('Sorting and Pagination', () => {
    it('Sorts by firstName ascending', async () => {
      const res = await request(app)
        .get(`/api/employees?sortBy=firstName&sortOrder=asc`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data[0].firstName).toBe('Alice');
      expect(res.body.data[1].firstName).toBe('Bob');
      expect(res.body.data[2].firstName).toBe('Charlie');
    });

    it('Sorts by firstName descending', async () => {
      const res = await request(app)
        .get(`/api/employees?sortBy=firstName&sortOrder=desc`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data[0].firstName).toBe('Charlie');
      expect(res.body.data[1].firstName).toBe('Bob');
      expect(res.body.data[2].firstName).toBe('Alice');
    });

    it('Rejects invalid sort field', async () => {
      const res = await request(app)
        .get(`/api/employees?sortBy=invalidField`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('Rejects invalid sort direction', async () => {
      const res = await request(app)
        .get(`/api/employees?sortOrder=invalidDirection`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('Paginates results correctly', async () => {
      const res = await request(app)
        .get(`/api/employees?page=1&limit=2&sortBy=firstName&sortOrder=asc`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(3);
      expect(res.body.meta.totalPages).toBe(2);
    });
  });

  describe('Filtering and Search', () => {
    it('Filters by department', async () => {
      const res = await request(app)
        .get(`/api/employees?department=Sales`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].firstName).toBe('Bob');
    });

    it('Searches by name', async () => {
      const res = await request(app)
        .get(`/api/employees?search=Xavier`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].firstName).toBe('Charlie');
    });
  });
});
