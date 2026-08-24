import axios from 'axios';

// Centralized single Axios instance
export const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});
