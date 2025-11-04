import api from '@/lib/api';
import { Produto, ApiResponse } from '@/types';

export const produtoService = {
  async getAllProdutos(filtro?: { id_categoria?: number; disponivel?: boolean }): Promise<Produto[]> {
    const params = new URLSearchParams();
    if (filtro?.id_categoria) params.append('id_categoria', filtro.id_categoria.toString());
    if (filtro?.disponivel !== undefined) params.append('disponivel', filtro.disponivel.toString());

    const response = await api.get<ApiResponse<Produto[]>>('/api/produtos', { params });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao buscar produtos');
    }
    
    return response.data.data;
  },

  async getProdutoById(id: number): Promise<Produto> {
    const response = await api.get<ApiResponse<Produto>>(`/api/produtos/${id}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao buscar produto');
    }
    
    return response.data.data;
  },
};