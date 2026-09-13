import { describe, expect, it, vi, beforeEach } from 'vitest';
import { axiosInstance, injectStore } from '../axios';
import { logout } from '../../../features/auth/authSlice';

describe('Axios Interceptors', () => {
  let mockStore: any;

  beforeEach(() => {
    mockStore = {
      getState: vi.fn(),
      dispatch: vi.fn(),
    };
    injectStore(mockStore);
    // clear request/response interceptors? We can just test them by pulling them from the instance.
  });

  it('adds Authorization header if token exists', async () => {
    mockStore.getState.mockReturnValue({ auth: { token: 'mock-token' } });
    
    // Find the request interceptor
    const requestInterceptor = (axiosInstance.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} };
    const result = await requestInterceptor(config);
    
    expect(result.headers.Authorization).toBe('Bearer mock-token');
  });

  it('does not add Authorization header if no token exists', async () => {
    mockStore.getState.mockReturnValue({ auth: { token: null } });
    
    const requestInterceptor = (axiosInstance.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} };
    const result = await requestInterceptor(config);
    
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('dispatches logout on 401 response', async () => {
    const responseInterceptorError = (axiosInstance.interceptors.response as any).handlers[0].rejected;
    const error = { response: { status: 401 } };
    
    try {
      await responseInterceptorError(error);
    } catch (e) {} // ignore rejection
    
    expect(mockStore.dispatch).toHaveBeenCalledWith(logout());
  });

  it('does not dispatch logout on other errors', async () => {
    const responseInterceptorError = (axiosInstance.interceptors.response as any).handlers[0].rejected;
    const error = { response: { status: 500 } };
    
    try {
      await responseInterceptorError(error);
    } catch (e) {}
    
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });
});