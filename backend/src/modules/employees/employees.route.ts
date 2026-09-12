import express, { Request, Response } from 'express';
import { z } from 'zod';
import { employeesController } from './employees.controller';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../common/async-handler';
import prisma from '../../db';
import { Prisma, Compensation } from '@prisma/client';

const router = express.Router();
router.use(authenticate);

// -------------------------------------------------------------
// Slice 2 Refactored Employee Endpoints
// -------------------------------------------------------------

router.get('/', employeesController.list);
router.get('/:id', employeesController.getById);

// -------------------------------------------------------------
// Slice 3 Pending: Compensation Endpoints (Inlined temporarily)
// -------------------------------------------------------------

const compensationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  effectiveDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  reason: z.string().optional()
});

router.get('/:id/compensations', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const id = req.params.id as string;

  const employee = await prisma.employee.findFirst({
    where: { id, tenantId }
  });

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  req.log?.info({ employeeId: id, action: 'read' }, 'Compensation history read');

  const compensations = await prisma.compensation.findMany({
    where: { employeeId: id, tenantId },
    orderBy: { effectiveDate: 'desc' }
  });

  res.json({ data: compensations.map((c: Compensation) => ({...c, amount: Number(c.amount)})) });
}));

router.post('/:id/compensations', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const id = req.params.id as string;

  const employee = await prisma.employee.findFirst({
    where: { id, tenantId },
    include: {
      compensations: {
        where: { effectiveDate: { lte: new Date() } },
        orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
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

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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