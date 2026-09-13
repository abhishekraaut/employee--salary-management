import prisma from '../../db';

export interface CompensationSummaryRow {
  group: string;
  headcount: number;
  totalPayroll: number;
  averageSalary: number;
  currency: string;
}

export class AnalyticsRepository {
  /**
   * We use a raw SQL query here to efficiently calculate aggregations.
   * Doing this via the ORM would require fetching all employees and their latest 
   * compensations into memory, leading to severe N+1 issues and memory bloat.
   * The SQL window function `ROW_NUMBER()` allows us to isolate the currently 
   * active salary per employee inside the database engine natively.
   */
  async getCompensationSummary(tenantId: string, groupBy: 'country' | 'department'): Promise<CompensationSummaryRow[]> {
    const query = `
      WITH LatestComp AS (
        SELECT
          c.employeeId,
          c.amount,
          c.currency,
          (CASE 
            WHEN c.currency = 'INR' THEN c.amount
            WHEN c.currency = 'USD' THEN c.amount * 83
            WHEN c.currency = 'GBP' THEN c.amount * 105
            WHEN c.currency = 'EUR' THEN c.amount * 90
            WHEN c.currency = 'CAD' THEN c.amount * 61
            WHEN c.currency = 'AUD' THEN c.amount * 54
            WHEN c.currency = 'SGD' THEN c.amount * 62
            WHEN c.currency = 'AED' THEN c.amount * 22.6
            ELSE c.amount
          END) as convertedAmount,
          ROW_NUMBER() OVER(PARTITION BY c.employeeId ORDER BY c.effectiveDate DESC, c.createdAt DESC) as rn
        FROM Compensation c
        WHERE c.tenantId = ? AND c.effectiveDate <= CURRENT_TIMESTAMP
      )
      SELECT
        e.${groupBy} as \`group\`,
        COUNT(e.id) as headcount,
        SUM(lc.convertedAmount) as totalPayroll,
        AVG(lc.convertedAmount) as averageSalary,
        'INR' as currency
      FROM Employee e
      LEFT JOIN LatestComp lc ON e.id = lc.employeeId AND lc.rn = 1
      WHERE e.tenantId = ?
      GROUP BY e.${groupBy}
      ORDER BY headcount DESC
    `;

    const results = await prisma.$queryRawUnsafe(query, tenantId, tenantId);

    // Prisma raw queries return Decimal objects or BigInts for counts, convert them appropriately
    return (results as any[]).map(row => ({
      group: row.group,
      headcount: Number(row.headcount),
      totalPayroll: Number(row.totalPayroll || 0),
      averageSalary: Number(row.averageSalary || 0),
      currency: row.currency || 'USD'
    }));
  }
}

export const analyticsRepository = new AnalyticsRepository();