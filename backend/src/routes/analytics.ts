import express, { Request, Response } from 'express';
import { asyncHandler } from '../common/async-handler';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

/**
 * @swagger
 * /api/analytics/compensation-summary:
 *   get:
 *     summary: Get compensation summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary
 *       401:
 *         description: Unauthorized
 */
router.get('/compensation-summary', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const groupBy = req.query.groupBy === 'country' ? 'country' : 'department';

  // We need to calculate aggregations (avg, sum, count) for the current salaries.
  // Because "current salary" requires picking the latest compensation per employee,
  // doing this in pure ORM without N+1 or pulling everything into memory is tricky.
  // The correct DB-level approach uses a window function or a subquery.
  // We'll use a raw query for efficiency.

  const query = `
    WITH LatestComp AS (
      SELECT
        c.employeeId,
        c.amount,
        c.currency,
        ROW_NUMBER() OVER(PARTITION BY c.employeeId ORDER BY c.effectiveDate DESC, c.createdAt DESC) as rn
      FROM Compensation c
      WHERE c.tenantId = ? AND c.effectiveDate <= CURRENT_TIMESTAMP
    )
    SELECT
      e.${groupBy} as \`group\`,
      COUNT(e.id) as headcount,
      SUM(lc.amount) as totalPayroll,
      AVG(lc.amount) as averageSalary,
      lc.currency
    FROM Employee e
    LEFT JOIN LatestComp lc ON e.id = lc.employeeId AND lc.rn = 1
    WHERE e.tenantId = ?
    GROUP BY e.${groupBy}, lc.currency
    ORDER BY headcount DESC
  `;

  const results = await prisma.$queryRawUnsafe(query, tenantId, tenantId);

  // Prisma raw queries return Decimal objects or BigInts for counts, convert them appropriately
  const serializedResults = (results as any[]).map(row => ({
    group: row.group,
    headcount: Number(row.headcount),
    totalPayroll: Number(row.totalPayroll || 0),
    averageSalary: Number(row.averageSalary || 0),
    currency: row.currency || 'USD'
  }));

  res.json({ data: serializedResults });
}));

export default router;
