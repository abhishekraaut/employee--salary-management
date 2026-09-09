import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from './axios';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  body?: AxiosRequestConfig['data']; // support RTK Query syntax
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
}

export interface ApiErrorResponse {
  status?: string;
  code?: number;
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const responseData = (error as { data?: ApiErrorResponse | string })?.data;
  if (typeof responseData === 'object' && responseData?.message) return responseData.message;
  if (typeof responseData === 'string') return responseData;
  return fallback;
}

export const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs | string, // Can pass full args or just a URL string for simple GETs
    unknown,
    unknown
  > =>
  async (requestOpts) => {
    try {
      const config: AxiosRequestConfig = typeof requestOpts === 'string'
        ? { url: requestOpts, method: 'GET' }
        : { ...requestOpts, data: requestOpts.data || requestOpts.body };

      const result = await axiosInstance(config);

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
