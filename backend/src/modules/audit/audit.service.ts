import { auditRepository, AuditContext } from './audit.repository';

export interface AuditPagination {
  page: number;
  limit: number;
}

export class AuditService {
  async getAuditLogs(context: AuditContext, pagination: AuditPagination) {
    let { page, limit } = pagination;
    
    // Normalize bounds
    page = page && page > 0 ? page : 1;
    limit = limit && limit > 0 ? limit : 50;
    limit = Math.min(limit, 100);

    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      auditRepository.count(context),
      auditRepository.findMany({ ...context, skip, take: limit })
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
      previousCurrency: log.previousCompensation?.currency || null,
      newCurrency: log.newCompensation?.currency || null
    }));

    return {
      data,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const auditService = new AuditService();