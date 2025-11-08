import { PedidoRepository } from '../repositories/pedidoRepository';
import { AuditRepository } from '../repositories/auditRepository';
import { MesaRepository } from '../repositories/mesaRepository';
import { Pedido, ItemPedido, StatusPedido, StatusCozinha } from '../types';

const pedidoRepository = new PedidoRepository();
const auditRepository = new AuditRepository();
const mesaRepository = new MesaRepository();

export class PedidoService {
  async getAllPedidos(filtro?: { status?: StatusPedido; id_mesa?: number }): Promise<Pedido[]> {
    return pedidoRepository.findAll(filtro);
  }

  async getPedidoById(id: number): Promise<any> {
    return pedidoRepository.findById(id);
  }

  async createPedido(id_mesa: number, id_garcom: number): Promise<Pedido> {
    // Verificar se a mesa existe
    const mesa = await mesaRepository.findById(id_mesa);
    if (!mesa) {
      throw new Error('Mesa não encontrada');
    }

    // Criar o pedido
    const pedido = await pedidoRepository.create(id_mesa, id_garcom);

    // Registrar auditoria
    await auditRepository.create('pedidos', pedido.id, 'create', id_garcom);

    // Atualizar status da mesa
    await mesaRepository.updateStatus(id_mesa, 'ocupada');

    return pedido;
  }

  async updatePedidoStatus(id: number, status: StatusPedido, id_usuario: number): Promise<Pedido> {
    const pedidoAtual = await pedidoRepository.findById(id);
    if (!pedidoAtual) {
      throw new Error('Pedido não encontrado');
    }

    const pedido = await pedidoRepository.updateStatus(id, status);

    // Registrar auditoria
    await auditRepository.create('pedidos', id, 'status_change', id_usuario, {
      status_anterior: pedidoAtual.status,
      status_novo: status,
    });

    // Se o pedido foi finalizado, liberar a mesa
    if (status === 'finalizado' || status === 'cancelado') {
      await mesaRepository.updateStatus(pedidoAtual.id_mesa, 'livre');
    }

    return pedido;
  }

  async deletePedido(id: number, id_usuario: number): Promise<boolean> {
    const pedidoAtual = await pedidoRepository.findById(id);
    if (!pedidoAtual) {
      throw new Error('Pedido não encontrado');
    }

    const resultado = await pedidoRepository.delete(id);
    if (resultado) {
      // Registrar auditoria
      await auditRepository.create('pedidos', id, 'delete', id_usuario, pedidoAtual);
      // Liberar a mesa
      await mesaRepository.updateStatus(pedidoAtual.id_mesa, 'livre');
    }

    return resultado;
  }

  async addItemPedido(
    id_pedido: number,
    id_produto: number,
    quantidade: number,
    preco_unitario: number,
    observacoes?: string,
    id_usuario?: number
  ): Promise<ItemPedido> {
    const pedido = await pedidoRepository.findById(id_pedido);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    const item = await pedidoRepository.addItem(
      id_pedido,
      id_produto,
      quantidade,
      preco_unitario,
      observacoes
    );

    // Registrar auditoria
    if (id_usuario) {
      await auditRepository.create('itens_pedido', item.id, 'create', id_usuario);
    }

    return item;
  }

  async updateItemStatus(id: number, status_cozinha: StatusCozinha, id_usuario: number): Promise<ItemPedido> {
    // Buscar o item diretamente no repository para pegar o status anterior
    const itemAtualizado = await pedidoRepository.updateItemStatus(id, status_cozinha);

    // Registrar auditoria
    await auditRepository.create('itens_pedido', id, 'status_change', id_usuario, {
      status_novo: status_cozinha,
    });

    return itemAtualizado;
  }

  async updateItemPedido(
    id: number,
    quantidade: number,
    observacoes?: string,
    id_usuario?: number
  ): Promise<ItemPedido> {
    const item = await pedidoRepository.updateItem(id, quantidade, observacoes);

    if (id_usuario) {
      await auditRepository.create('itens_pedido', id, 'update', id_usuario);
    }

    return item;
  }

  async deleteItemPedido(id: number, id_usuario: number): Promise<boolean> {
    const resultado = await pedidoRepository.deleteItem(id);
    
    if (resultado) {
      // Registrar auditoria
      await auditRepository.create('itens_pedido', id, 'delete', id_usuario);
    }

    return resultado;
  }
}