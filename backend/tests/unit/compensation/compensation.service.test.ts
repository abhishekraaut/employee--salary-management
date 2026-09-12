import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompensationService } from '../../../src/modules/compensation/compensation.service';
import { compensationRepository } from '../../../src/modules/compensation/compensation.repository';
import { NotFoundError, BadRequestError } from '../../../src/common/errors';

vi.mock('../../../src/modules/compensation/compensation.repository');

describe('CompensationService', () => {
  let compensationService: CompensationService;

  beforeEach(() => {
    vi.clearAllMocks();
    compensationService = new CompensationService();
  });

  describe('addCompensation', () => {
    it('throws BadRequestError for invalid compensation amount', async () => {
      await expect(compensationService.addCompensation({
        tenantId: 'tenant-1', employeeId: 'emp-1', amount: -500, currency: 'USD',
        effectiveDate: new Date(), actorId: 'actor-1'
      })).rejects.toThrow(BadRequestError);
      
      await expect(compensationService.addCompensation({
        tenantId: 'tenant-1', employeeId: 'emp-1', amount: 0, currency: 'USD',
        effectiveDate: new Date(), actorId: 'actor-1'
      })).rejects.toThrow(BadRequestError);
    });

    it('throws BadRequestError for invalid effective date', async () => {
      await expect(compensationService.addCompensation({
        tenantId: 'tenant-1', employeeId: 'emp-1', amount: 50000, currency: 'USD',
        effectiveDate: new Date('invalid-date'), actorId: 'actor-1'
      })).rejects.toThrow(BadRequestError);
    });

    it('throws NotFoundError if employee does not exist or is cross-tenant', async () => {
      vi.mocked(compensationRepository.addCompensationWithAudit).mockResolvedValue(null);

      await expect(compensationService.addCompensation({
        tenantId: 'tenant-1', employeeId: 'emp-1', amount: 50000, currency: 'USD',
        effectiveDate: new Date(), actorId: 'actor-1'
      })).rejects.toThrow(NotFoundError);
    });

    it('returns new compensation on successful creation', async () => {
      const mockResult = {
        id: 'comp-1', tenantId: 'tenant-1', employeeId: 'emp-1',
        amount: new (require('@prisma/client').Prisma.Decimal)(50000),
        currency: 'USD', effectiveDate: new Date(),
        createdAt: new Date(), createdBy: 'actor-1'
      };
      
      vi.mocked(compensationRepository.addCompensationWithAudit).mockResolvedValue(mockResult as any);

      const result = await compensationService.addCompensation({
        tenantId: 'tenant-1', employeeId: 'emp-1', amount: 50000, currency: 'USD',
        effectiveDate: new Date(), actorId: 'actor-1'
      });

      expect(result.id).toBe('comp-1');
      expect(result.amount).toBe(50000);
      expect(compensationRepository.addCompensationWithAudit).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        amount: 50000
      }));
    });
  });

  describe('getHistory', () => {
    it('throws NotFoundError if employee does not exist', async () => {
      vi.mocked(compensationRepository.findHistory).mockResolvedValue(null);

      await expect(compensationService.getHistory({
        tenantId: 'tenant-1', employeeId: 'emp-1'
      })).rejects.toThrow(NotFoundError);
    });

    it('returns formatted history if employee exists', async () => {
      const mockHistory = [{
        id: 'comp-1', tenantId: 'tenant-1', employeeId: 'emp-1',
        amount: new (require('@prisma/client').Prisma.Decimal)(50000),
        currency: 'USD', effectiveDate: new Date(),
        createdAt: new Date(), createdBy: 'actor-1'
      }];
      
      vi.mocked(compensationRepository.findHistory).mockResolvedValue(mockHistory as any);

      const result = await compensationService.getHistory({
        tenantId: 'tenant-1', employeeId: 'emp-1'
      });

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(50000);
    });
  });
});