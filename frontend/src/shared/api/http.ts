import type { AxiosRequestConfig } from 'axios';
import { axiosInstance } from './axios';

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