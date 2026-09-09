import { apiSlice } from '../../shared/api/baseApi';

export interface LoginData {
  token: string;
  user: {
    id: string;
    name: string;
    tenantId: string;
  };
}

export interface LoginResponse {
  data: LoginData;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
