import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../../../src/modules/analytics/analytics.service';
import { analyticsRepository } from '../../../src/modules/analytics/analytics.repository';

vi.mock('../../../src/modules/analytics/analytics.repository');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    analyticsService = new AnalyticsService();
  });

  describe('getCompensationSummary', () => {
    it('calls the repository with correct tenantId and groupBy', async () => {
      vi.mocked(analyticsRepository.getCompensationSummary).mockResolvedValue([
        { group: 'Engineering', headcount: 5, totalPayroll: 500000, averageSalary: 100000, currency: 'USD' }
      ]);

      const result = await analyticsService.getCompensationSummary('tenant-1', 'department');

      expect(analyticsRepository.getCompensationSummary).toHaveBeenCalledWith('tenant-1', 'department');
      expect(result).toEqual([
        { group: 'Engineering', headcount: 5, totalPayroll: 500000, averageSalary: 100000, currency: 'USD' }
      ]);
    });

    it('handles empty results from the repository', async () => {
      vi.mocked(analyticsRepository.getCompensationSummary).mockResolvedValue([]);

      const result = await analyticsService.getCompensationSummary('tenant-1', 'country');

      expect(analyticsRepository.getCompensationSummary).toHaveBeenCalledWith('tenant-1', 'country');
      expect(result).toEqual([]);
    });
  });
});