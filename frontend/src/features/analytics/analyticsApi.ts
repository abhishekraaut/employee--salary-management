import { apiSlice } from '../../shared/api/baseApi';

export interface AnalyticsMetric {
  group: string;
  headcount: number;
  totalPayroll: number;
  averageSalary: number;
  currency: string;
}

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompensationSummary: builder.query<{ data: AnalyticsMetric[] }, 'department' | 'country'>({
      query: (groupBy) => `/analytics/compensation-summary?groupBy=${groupBy}`,
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useGetCompensationSummaryQuery } = analyticsApi;
