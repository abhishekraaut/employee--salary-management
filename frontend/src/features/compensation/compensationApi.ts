import { apiSlice } from '../../shared/api/baseApi';

export interface Compensation {
  id: string;
  amount: number;
  currency: string;
  effectiveDate: string;
  reason?: string;
}

export const compensationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompensations: builder.query<{ data: Compensation[] }, string>({
      query: (employeeId) => `/employees/${employeeId}/compensations`,
      providesTags: (result, error, employeeId) => [{ type: 'Compensation', id: employeeId }],
    }),
    createCompensation: builder.mutation<Compensation, { employeeId: string; amount: number; currency: string; effectiveDate: string; reason?: string }>({
      query: ({ employeeId, ...body }) => ({
        url: `/employees/${employeeId}/compensations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { employeeId }) => [
        { type: 'Compensation', id: employeeId },
        { type: 'Employee', id: employeeId },
        { type: 'Employee', id: 'LIST' },
        'Analytics',
        'Audit'
      ],
    }),
  }),
});

export const { useGetCompensationsQuery, useCreateCompensationMutation } = compensationApi;
