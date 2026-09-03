import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// Validation Schemas
const querySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1')).refine(val => val > 0),
  limit: z.string().optional().transform(v => parseInt(v || '50')).refine(val => val > 0 && val <= 100),
  search: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'hireDate', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const compensationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  effectiveDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  reason: z.string().optional()
});

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 *       401:
 *         description: Unauthorized
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const parsedQuery = querySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.format() });
    return;
  }

  const { page, limit, search, department, country, sortBy, sortOrder } = parsedQuery.data;
  const skip = (page - 1) * limit;

  const where: any = { tenantId };
  if (department) where.department = department;
  if (country) where.country = country;
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } }
    ];
  }

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        compensations: {
          orderBy: { effectiveDate: 'desc' },
          take: 1
        }
      }
    })
  ]);

  const data = employees.map(emp => ({
    id: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    department: emp.department,
    country: emp.country,
    currentSalary: emp.compensations[0]?.amount ? Number(emp.compensations[0].amount) : null,
    currency: emp.compensations[0]?.currency || null,
  }));

  res.json({
    data,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee details
 *       404:
 *         description: Not found
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const id = req.params.id as string;
  const employee = await prisma.employee.findFirst({
    where: { id, tenantId }
  });

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  res.json(employee);
}));

/**
 * @swagger
 * /api/employees/{id}/compensations:
 *   get:
 *     summary: Get employee compensations
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee compensations
 *       404:
 *         description: Not found
 */
router.get('/:id/compensations', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const id = req.params.id as string;
  
  // Verify ownership
  const employee = await prisma.employee.findFirst({
    where: { id, tenantId }
  });

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  if (req.log) {
    req.log.info({ employeeId: id, action: 'deleted' }, 'Employee deleted');
  }

  const compensations = await prisma.compensation.findMany({
    where: { employeeId: id, tenantId },
    orderBy: { effectiveDate: 'desc' }
  });

  res.json({ data: compensations.map(c => ({...c, amount: Number(c.amount)})) });
}));

/**
 * @swagger
 * /api/employees/{id}/compensations:
 *   post:
 *     summary: Add employee compensation
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - effectiveDate
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compensation added
 *       404:
 *         description: Not found
 */
router.post('/:id/compensations', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const id = req.params.id as string;
  
  // Verify ownership and get current comp
  const employee = await prisma.employee.findFirst({
    where: { id, tenantId },
    include: {
      compensations: {
        orderBy: { effectiveDate: 'desc' },
        take: 1
      }
    }
  });

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const parsedBody = compensationSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.format() });
    return;
  }

  const previousCompId = employee.compensations[0]?.id || null;

  // Use a transaction to ensure both compensation and audit log are created atomically
  const result = await prisma.$transaction(async (tx) => {
    const newCompensation = await tx.compensation.create({
      data: {
        tenantId,
        employeeId: employee.id,
        amount: parsedBody.data.amount,
        currency: parsedBody.data.currency,
        effectiveDate: new Date(parsedBody.data.effectiveDate),
        createdBy: req.user!.id
      }
    });

    const audit = await tx.auditLog.create({
      data: {
        tenantId,
        employeeId: employee.id,
        actorId: req.user!.id,
        action: 'SALARY_UPDATE',
        entity: 'COMPENSATION',
        previousCompensationId: previousCompId,
        newCompensationId: newCompensation.id,
        reason: parsedBody.data.reason || 'Salary updated',
      }
    });

    return { newCompensation, audit };
  });

  if (req.log) {
    req.log.info({
      msg: 'Salary updated successfully',
      tenantId,
      employeeId: employee.id,
      amount: result.newCompensation.amount,
      actor: req.user!.id
    });
  }

  res.status(201).json({ ...result.newCompensation, amount: Number(result.newCompensation.amount) });
}));

export default router;
