import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// Validation Schemas
const querySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1')),
  limit: z.string().optional().transform(v => parseInt(v || '50')),
  search: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional()
});

const compensationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  effectiveDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  })
});

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const parsedQuery = querySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.errors });
    return;
  }

  const { page, limit, search, department, country } = parsedQuery.data;
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
    currentSalary: emp.compensations[0]?.amount || null,
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

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, tenantId }
  });

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  res.json(employee);
}));

router.get('/:id/compensations', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const compensations = await prisma.compensation.findMany({
    where: { employeeId: req.params.id, tenantId },
    orderBy: { effectiveDate: 'desc' }
  });

  res.json({ data: compensations });
}));

router.post('/:id/compensations', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  
  // Verify ownership
  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, tenantId }
  });

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const parsedBody = compensationSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.errors });
    return;
  }

  const newCompensation = await prisma.compensation.create({
    data: {
      tenantId,
      employeeId: req.params.id,
      amount: parsedBody.data.amount,
      currency: parsedBody.data.currency,
      effectiveDate: new Date(parsedBody.data.effectiveDate),
      createdBy: req.user!.id
    }
  });

  req.log.info({
    msg: 'Salary updated',
    tenantId,
    employeeId: req.params.id,
    amount: newCompensation.amount,
    actor: req.user!.id
  });

  res.status(201).json(newCompensation);
}));

export default router;
