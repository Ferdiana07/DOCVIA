import axios from 'axios';

/**
 * Axios instance configured for the DOCVIA API.
 *
 * Why a custom instance?
 * - Sets the base URL from the environment variable once (no repeated URL everywhere)
 * - Automatically attaches the JWT token to every request via interceptor
 * - Handles 401 (token expired) by clearing storage and redirecting to login
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isCredentialAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    if (error.response?.status === 401 && !isCredentialAttempt) {
      // Token expired or invalid — clear auth state and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
