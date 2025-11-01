import { create } from 'zustand';
import { AuthState, Usuario } from '@/types';

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  usuario: typeof window !== 'undefined' 
    ? (() => {
        try {
          const stored = localStorage.getItem('usuario');
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      })()
    : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,

  login: (token: string, usuario: Usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    set({
      token,
      usuario,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    set({
      token: null,
      usuario: null,
      isAuthenticated: false,
    });
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
}));
