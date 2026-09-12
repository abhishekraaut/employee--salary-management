import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auditService } from './audit.service';

const querySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1')).refine(val => val > 0),
  limit: z.string().optional().transform(v => parseInt(v || '50')).refine(val => val > 0 && val <= 100)
});

export class AuditController {
  getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const parsedQuery = querySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        return res.status(400).json({ error: parsedQuery.error.format() });
      }

      const { page, limit } = parsedQuery.data;

      const results = await auditService.getAuditLogs({ tenantId }, { page, limit });

      res.json(results);
    } catch (error) {
      next(error);
    }
  };
}

export const auditController = new AuditController();