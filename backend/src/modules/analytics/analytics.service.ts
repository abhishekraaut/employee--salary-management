import { analyticsRepository } from './analytics.repository';

export class AnalyticsService {
  async getCompensationSummary(tenantId: string, groupBy: 'country' | 'department') {
    return analyticsRepository.getCompensationSummary(tenantId, groupBy);
  }
}

export const analyticsService = new AnalyticsService();