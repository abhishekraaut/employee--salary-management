import { apiSlice } from '../../shared/api/baseApi';

export interface AuditRecord {
  id: string;
  timestamp: string;
  action: string;
  reason?: string;
  actorName: string;
  employeeName: string;
  employeeId: string;
  previousSalary: number | null;
  newSalary: number | null;
  previousCurrency: string | null;
  newCurrency: string | null;
}

export interface AuditResponse {
  data: AuditRecord[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export const auditApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => `/audit?page=${page}&limit=${limit}`,
      providesTags: ['Audit'],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
