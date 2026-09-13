import axios from 'axios';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

// Centralized single Axios instance
export const axiosInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 10000,
});

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
    if (error.response?.status === 401 && store) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);