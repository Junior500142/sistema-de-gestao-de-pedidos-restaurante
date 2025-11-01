import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ===============================
// 🌍 Definição da URL base
// ===============================
const API_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    : process.env.BACKEND_URL || 'http://feijuca-backend:3001';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // garante envio de cookies se precisar
});

// ===============================
// 🔐 Interceptor de requisição (adiciona token)
// ===============================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        // Forma correta para Axios v1+: usar .set()
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          // fallback se o tipo for objeto simples
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// ⚠️ Interceptor de resposta (tratamento de erros 401)
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
