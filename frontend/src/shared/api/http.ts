import type { AxiosRequestConfig } from 'axios';
import { axiosInstance } from './axios';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';

// Reference to store to avoid circular dependency issues if initialized later
let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};

// Request Interceptor: Attach Auth Token
axiosInstance.interceptors.request.use(
  (config) => {
    if (store) {
      const state = store.getState() as RootState;
      const token = state.auth.token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Normalization & 401 Handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for 401 Unauthorized
    if (error.response?.status === 401 && store) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

// Typed HTTP Abstraction
export const api = {
  get: <TResponse>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<TResponse>(url, config).then(res => res.data),

  post: <TRequest, TResponse>(url: string, data?: TRequest, config?: AxiosRequestConfig) =>
    axiosInstance.post<TResponse>(url, data, config).then(res => res.data),

  formData: <TResponse>(url: string, data: FormData, config?: AxiosRequestConfig) =>
    axiosInstance.post<TResponse>(url, data, config).then(res => res.data),

  blob: (url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<Blob>(url, { ...config, responseType: 'blob' }).then(res => res.data),
};
