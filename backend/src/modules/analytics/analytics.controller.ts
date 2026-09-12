import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analyticsService } from './analytics.service';
import { BadRequestError } from '../../common/errors';

export class AnalyticsController {
  getCompensationSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const groupBy = req.query.groupBy === 'country' ? 'country' : 'department';

      const results = await analyticsService.getCompensationSummary(tenantId, groupBy);

      res.json({ data: results });
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();