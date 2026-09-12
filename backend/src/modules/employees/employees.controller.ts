import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { employeesService } from './employees.service';
import { BadRequestError } from '../../common/errors';

const querySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1')).refine(val => val > 0),
  limit: z.string().optional().transform(v => parseInt(v || '50')).refine(val => val > 0 && val <= 100),
  search: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'hireDate', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export class EmployeesController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const parsedQuery = querySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        // Keeping original 400 shape: { error: format }
        return res.status(400).json({ error: parsedQuery.error.format() });
      }

      const { page, limit, search, department, country, sortBy, sortOrder } = parsedQuery.data;

      const result = await employeesService.getEmployees(
        { tenantId, search, department, country },
        { page, limit },
        { sortBy, sortOrder }
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const id = req.params.id as string;

      const employee = await employeesService.getEmployeeById({ tenantId, employeeId: id });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  };
}

export const employeesController = new EmployeesController();