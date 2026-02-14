import api from '@/lib/api';
import { LoginCredentials, RegisterCredentials, LoginResponse } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    await api.post('/auth/register', credentials);
  },

  async getPendingUsers() {
    const response = await api.get('/auth/pending-users');
    return response.data.data;
  },

  async approveUser(id: number) {
    await api.patch(`/auth/approve-user/${id}`);
  },

  async rejectUser(id: number) {
    await api.delete(`/auth/reject-user/${id}`);
  }
};
