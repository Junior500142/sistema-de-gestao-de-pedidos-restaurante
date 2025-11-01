import api from '@/lib/api';
import { LoginResponse, Usuario, ApiResponse } from '@/types';

export const authService = {
  async login(email: string, senha: string): Promise<LoginResponse> {
    try {
      console.log('🔹 Enviando login para backend...', { email });
      const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', {
        email,
        senha,
      });
      console.log('🔹 Resposta do login:', response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Erro ao fazer login');
      }

      return response.data.data;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  },

  async register(nome: string, email: string, senha: string): Promise<Usuario> {
    try {
      console.log('🔹 Enviando registro para backend...', { nome, email });
      const response = await api.post<ApiResponse<Usuario>>('/api/auth/register', {
        nome,
        email,
        senha,
      });
      console.log('🔹 Resposta do registro:', response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Erro ao registrar');
      }

      return response.data.data;
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    }
  },

  async createUser(
    nome: string,
    email: string,
    senha: string,
    tipo_usuario: 'atendente' | 'cozinha' | 'admin' = 'atendente'
  ): Promise<Usuario> {
    try {
      console.log('🔹 Criando usuário via backend...', { nome, email, tipo_usuario });
      const response = await api.post<ApiResponse<Usuario>>('/api/auth/users', {
        nome,
        email,
        senha,
        tipo_usuario,
      });
      console.log('🔹 Resposta da criação de usuário:', response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Erro ao criar usuário');
      }

      return response.data.data;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  },
};
