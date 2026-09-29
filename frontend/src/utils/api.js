import axios from 'axios';
import { demoAdapter } from './demoBackend';

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
export const DEMO_MODE = !BACKEND_URL;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (DEMO_MODE) {
  api.defaults.adapter = demoAdapter;
  api.defaults.baseURL = '';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = (error.config?.url || '').startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = `${process.env.PUBLIC_URL}/`;
    }
    return Promise.reject(error);
  }
);

export default api;
