import prisma from '../../db';
import { Prisma } from '@prisma/client';
import { CompensationContext, CreateCompensationParams } from './compensation.types';

export class CompensationRepository {
  async findHistory(context: CompensationContext) {
    const employee = await prisma.employee.findFirst({
      where: { id: context.employeeId, tenantId: context.tenantId }
    });

    if (!employee) return null;

    return prisma.compensation.findMany({
      where: { employeeId: context.employeeId, tenantId: context.tenantId },
      orderBy: { effectiveDate: 'desc' }
    });
  }

  async addCompensationWithAudit(params: CreateCompensationParams) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const employee = await tx.employee.findFirst({
        where: { id: params.employeeId, tenantId: params.tenantId },
        include: {
          compensations: {
            where: { effectiveDate: { lte: new Date() } },
            orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
            take: 1
          }
        }
      });

      if (!employee) {
        return null;
      }

      const previousCompId = employee.compensations[0]?.id || null;

      const newCompensation = await tx.compensation.create({
        data: {
          tenantId: params.tenantId,
          employeeId: params.employeeId,
          amount: params.amount,
          currency: params.currency,
          effectiveDate: params.effectiveDate,
          createdBy: params.actorId
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: params.tenantId,
          employeeId: params.employeeId,
          actorId: params.actorId,
          action: 'SALARY_UPDATE',
          entity: 'COMPENSATION',
          previousCompensationId: previousCompId,
          newCompensationId: newCompensation.id,
          reason: params.reason || 'Salary updated',
        }
      });

      return newCompensation;
    });
  }
}

export const compensationRepository = new CompensationRepository();