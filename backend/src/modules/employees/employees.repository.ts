import prisma from '../../db';
import { Prisma } from '@prisma/client';

export interface GetEmployeesFilters {
  tenantId: string;
  department?: string;
  country?: string;
  search?: string;
}

export interface PaginationParams {
  skip: number;
  take: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface EmployeeIdContext {
  tenantId: string;
  employeeId: string;
}

export class EmployeesRepository {
  private buildWhereClause(filters: GetEmployeesFilters): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = { tenantId: filters.tenantId };
    
    if (filters.department) where.department = filters.department;
    if (filters.country) where.country = filters.country;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } }
      ];
    }
    
    return where;
  }

  async count(filters: GetEmployeesFilters): Promise<number> {
    return prisma.employee.count({
      where: this.buildWhereClause(filters)
    });
  }

  async findManyWithLatestCompensation(
    filters: GetEmployeesFilters,
    pagination: PaginationParams,
    sort: SortParams
  ) {
    return prisma.employee.findMany({
      where: this.buildWhereClause(filters),
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { [sort.sortBy]: sort.sortOrder },
      include: {
        compensations: {
          where: { effectiveDate: { lte: new Date() } },
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
          take: 1
        }
      }
    });
  }

  async findById(context: EmployeeIdContext) {
    return prisma.employee.findFirst({
      where: {
        id: context.employeeId,
        tenantId: context.tenantId
      }
    });
  }
}

export const employeesRepository = new EmployeesRepository();