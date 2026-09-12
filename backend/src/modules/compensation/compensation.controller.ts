import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { compensationService } from './compensation.service';
import { NotFoundError, BadRequestError } from '../../common/errors';

const compensationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  effectiveDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  reason: z.string().optional()
});

export class CompensationController {
  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const employeeId = req.params.id as string; // Using exact previous URL pattern

      const compensations = await compensationService.getHistory({ tenantId, employeeId });
      
      if (req.log) {
        req.log.info({ employeeId, action: 'read' }, 'Compensation history read');
      }

      res.json({ data: compensations });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return res.status(409).json({ error: 'A compensation record already exists for this effective date.' });
      }
      next(error);
    }
  };

  addCompensation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const employeeId = req.params.id as string;

      const parsedBody = compensationSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ error: parsedBody.error.format() });
      }

      const result = await compensationService.addCompensation({
        tenantId,
        employeeId,
        amount: parsedBody.data.amount,
        currency: parsedBody.data.currency,
        effectiveDate: new Date(parsedBody.data.effectiveDate),
        reason: parsedBody.data.reason,
        actorId: req.user!.id
      });

      if (req.log) {
        req.log.info({
          msg: 'Salary updated successfully',
          tenantId,
          employeeId,
          amount: result.amount,
          actor: req.user!.id
        });
      }

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return res.status(409).json({ error: 'A compensation record already exists for this effective date.' });
      }
      next(error);
    }
  };
}

export const compensationController = new CompensationController();