import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from '../../../src/modules/audit/audit.service';
import { auditRepository } from '../../../src/modules/audit/audit.repository';

vi.mock('../../../src/modules/audit/audit.repository');

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();
    auditService = new AuditService();
  });

  describe('getAuditLogs', () => {
    it('normalizes pagination and calculates skip properly', async () => {
      vi.mocked(auditRepository.count).mockResolvedValue(150);
      vi.mocked(auditRepository.findMany).mockResolvedValue([]);

      await auditService.getAuditLogs({ tenantId: 'tenant-1' }, { page: 3, limit: 15 });

      expect(auditRepository.count).toHaveBeenCalledWith({ tenantId: 'tenant-1' });
      expect(auditRepository.findMany).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
        skip: 30, // (3 - 1) * 15
        take: 15
      });
    });

    it('enforces maximum limit bounds (max 100)', async () => {
      vi.mocked(auditRepository.count).mockResolvedValue(150);
      vi.mocked(auditRepository.findMany).mockResolvedValue([]);

      await auditService.getAuditLogs({ tenantId: 'tenant-1' }, { page: 1, limit: 500 });

      expect(auditRepository.findMany).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
        skip: 0,
        take: 100
      });
    });

    it('formats repository results correctly', async () => {
      vi.mocked(auditRepository.count).mockResolvedValue(1);
      vi.mocked(auditRepository.findMany).mockResolvedValue([{
        id: 'log-1',
        createdAt: new Date('2026-01-01'),
        action: 'SALARY_UPDATE',
        reason: 'Promotion',
        actor: { name: 'Admin', email: 'admin@test.com' },
        employee: { firstName: 'John', lastName: 'Doe', id: 'emp-1' },
        previousCompensation: { amount: new (require('@prisma/client').Prisma.Decimal)(50000), currency: 'USD' },
        newCompensation: { amount: new (require('@prisma/client').Prisma.Decimal)(60000), currency: 'USD' }
      }] as any);

      const result = await auditService.getAuditLogs({ tenantId: 'tenant-1' }, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: 'log-1',
        action: 'SALARY_UPDATE',
        reason: 'Promotion',
        actorName: 'Admin',
        employeeName: 'John Doe',
        employeeId: 'emp-1',
        previousSalary: 50000,
        newSalary: 60000,
        currency: 'USD'
      });
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        totalPages: 1
      });
    });
  });
});