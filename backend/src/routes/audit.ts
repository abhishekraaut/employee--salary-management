import express, { Request, Response } from 'express';
import { asyncHandler } from '../common/async-handler';
import { z } from 'zod';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

const querySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1')).refine(val => val > 0),
  limit: z.string().optional().transform(v => parseInt(v || '50')).refine(val => val > 0 && val <= 100)
});

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
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

  const { page, limit } = parsedQuery.data;
  const skip = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where: { tenantId } }),
    prisma.auditLog.findMany({
      where: { tenantId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { name: true, email: true } },
        employee: { select: { firstName: true, lastName: true, id: true } },
        previousCompensation: { select: { amount: true, currency: true } },
        newCompensation: { select: { amount: true, currency: true } }
      }
    })
  ]);

  const data = logs.map(log => ({
    id: log.id,
    timestamp: log.createdAt,
    action: log.action,
    reason: log.reason,
    actorName: log.actor.name,
    employeeName: `${log.employee.firstName} ${log.employee.lastName}`,
    employeeId: log.employee.id,
    previousSalary: log.previousCompensation?.amount ? Number(log.previousCompensation.amount) : null,
    newSalary: log.newCompensation ? Number(log.newCompensation.amount) : null,
    currency: log.newCompensation?.currency || 'USD'
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

export default router;
