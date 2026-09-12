import prisma from '../../db';

export interface AuditContext {
  tenantId: string;
}

export interface AuditQueryContext extends AuditContext {
  skip: number;
  take: number;
}

export class AuditRepository {
  async count(context: AuditContext): Promise<number> {
    return prisma.auditLog.count({
      where: { tenantId: context.tenantId }
    });
  }

  async findMany(context: AuditQueryContext) {
    return prisma.auditLog.findMany({
      where: { tenantId: context.tenantId },
      skip: context.skip,
      take: context.take,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { name: true, email: true } },
        employee: { select: { firstName: true, lastName: true, id: true } },
        previousCompensation: { select: { amount: true, currency: true } },
        newCompensation: { select: { amount: true, currency: true } }
      }
    });
  }
}

export const auditRepository = new AuditRepository();