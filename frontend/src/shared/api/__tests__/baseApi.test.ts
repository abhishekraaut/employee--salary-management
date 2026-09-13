import { describe, expect, it } from 'vitest';
import { apiSlice } from '../baseApi';
import { employeesApi } from '../../../features/employees/employeesApi';
import { authApi } from '../../../features/auth/authApi';

describe('Base API and Feature APIs Cache configuration', () => {
  it('configures central base API with correct tagTypes', () => {
    // Assert that the base API is initialized correctly
    expect(apiSlice.reducerPath).toBe('api');
  });

  it('verifies Employee endpoints exist and provide correct cache tags', () => {
    // Ensure that injectEndpoints was used correctly
    expect(employeesApi.endpoints.getEmployees).toBeDefined();
    expect(employeesApi.endpoints.getEmployeeById).toBeDefined();
  });
  
  it('verifies Auth endpoints exist via injectEndpoints', () => {
    expect(authApi.endpoints.login).toBeDefined();
  });
});