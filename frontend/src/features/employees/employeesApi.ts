import { apiSlice } from '../../shared/api/baseApi';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  country: string;
  currentSalary?: number;
  currency?: string;
  hireDate?: string;
  createdAt?: string;
}

export interface EmployeesResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface GetEmployeesArgs {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  country?: string;
  sortBy?: 'firstName' | 'lastName' | 'hireDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const employeesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EmployeesResponse, GetEmployeesArgs>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg.page) params.append('page', arg.page.toString());
        if (arg.limit) params.append('limit', arg.limit.toString());
        if (arg.search) params.append('search', arg.search);
        if (arg.department) params.append('department', arg.department);
        if (arg.country) params.append('country', arg.country);
        if (arg.sortBy) params.append('sortBy', arg.sortBy);
        if (arg.sortOrder) params.append('sortOrder', arg.sortOrder);

        return `/employees?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Employee' as const, id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),
    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
  }),
});

export const { useGetEmployeesQuery, useGetEmployeeByIdQuery } = employeesApi;
