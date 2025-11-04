import api from '@/lib/api';
import { Pedido, ItemPedido, StatusPedido, StatusCozinha, ApiResponse } from '@/types';

export const pedidoService = {
  async getAllPedidos(filtro?: { status?: StatusPedido; id_mesa?: number }): Promise<Pedido[]> {
    const params = new URLSearchParams();
    if (filtro?.status) params.append('status', filtro.status);
    if (filtro?.id_mesa) params.append('id_mesa', filtro.id_mesa.toString());

    const response = await api.get<ApiResponse<Pedido[]>>('/api/pedidos', { params });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao buscar pedidos');
    }

    return response.data.data;
  },

  async getPedidoById(id: number): Promise<Pedido> {
    const response = await api.get<ApiResponse<Pedido>>(`/api/pedidos/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao buscar pedido');
    }

    return response.data.data;
  },

  async createPedido(id_mesa: number): Promise<Pedido> {
    const response = await api.post<ApiResponse<Pedido>>('/api/pedidos', {
      id_mesa,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao criar pedido');
    }

    return response.data.data;
  },

  async updatePedidoStatus(id: number, status: StatusPedido): Promise<Pedido> {
    const response = await api.patch<ApiResponse<Pedido>>(`/api/pedidos/${id}/status`, {
      status,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar pedido');
    }

    return response.data.data;
  },

  async deletePedido(id: number): Promise<void> {
    const response = await api.delete<ApiResponse>(`/api/pedidos/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao deletar pedido');
    }
  },

  async addItemPedido(
    id_pedido: number,
    id_produto: number,
    quantidade: number,
    preco_unitario: number,
    observacoes?: string
  ): Promise<ItemPedido> {
    const response = await api.post<ApiResponse<ItemPedido>>(`/api/pedidos/${id_pedido}/itens`, {
      id_produto,
      quantidade,
      preco_unitario,
      observacoes,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao adicionar item');
    }

    return response.data.data;
  },

  async updateItemStatus(id: number, status_cozinha: StatusCozinha): Promise<ItemPedido> {
    const response = await api.patch<ApiResponse<ItemPedido>>(`/api/pedidos/itens/${id}/status`, {
      status_cozinha,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar item');
    }

    return response.data.data;
  },

  async deleteItemPedido(id: number): Promise<void> {
    const response = await api.delete<ApiResponse>(`/api/pedidos/itens/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao deletar item');
    }
  },
};