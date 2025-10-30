import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    api.post('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),

  googleAuth: (google_token: string) =>
    api.post('/api/auth/google', { google_token }),

  logout: () => api.post('/api/auth/logout'),
};

// Bots API
export const botsAPI = {
  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/api/bots', { params }),

  create: (data: { website_url: string; bot_name: string }) =>
    api.post('/api/bots/create', data),

  get: (bot_id: string) =>
    api.get(`/api/bots/${bot_id}`),

  update: (bot_id: string, data: any) =>
    api.put(`/api/bots/${bot_id}`, data),

  delete: (bot_id: string) =>
    api.delete(`/api/bots/${bot_id}`),

  test: (bot_id: string, message: string) =>
    api.post(`/api/bots/${bot_id}/test`, { message }),

  chat: (bot_id: string, data: { message: string; session_id?: string }) =>
    api.post(`/api/bots/${bot_id}/chat`, data),
};

export default api;
