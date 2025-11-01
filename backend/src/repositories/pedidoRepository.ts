import { pool } from '../config/database';
import { Pedido, StatusPedido, ItemPedido, StatusCozinha } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class PedidoRepository {
  async findById(id: number): Promise<(Pedido & { itens: ItemPedido[] }) | null> {
    const [pedidoRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedidoRows.length === 0) return null;

    const [itensRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM itens_pedido WHERE id_pedido = ? ORDER BY criado_em ASC',
      [id]
    );

    return {
      ...this.mapRow(pedidoRows[0]),
      itens: itensRows.map(row => this.mapItemRow(row)),
    };
  }

  async findAll(filtro?: { status?: StatusPedido; id_mesa?: number }): Promise<Pedido[]> {
    let query = 'SELECT * FROM pedidos WHERE 1=1';
    const values: any[] = [];

    if (filtro?.status) {
      query += ' AND status = ?';
      values.push(filtro.status);
    }
    if (filtro?.id_mesa) {
      query += ' AND id_mesa = ?';
      values.push(filtro.id_mesa);
    }

    query += ' ORDER BY criado_em DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, values);
    return rows.map(row => this.mapRow(row));
  }

  async create(id_mesa: number, id_garcom: number): Promise<Pedido> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO pedidos (id_mesa, id_garcom, status) VALUES (?, ?, ?)',
      [id_mesa, id_garcom, 'aberto']
    );

    const pedido = await this.findById(result.insertId);
    if (!pedido) throw new Error('Erro ao criar pedido');

    return pedido;
  }

  async updateStatus(id: number, status: StatusPedido): Promise<Pedido> {
    const updates = ['status = ?'];
    const values: any[] = [status];

    if (status === 'pago' || status === 'finalizado') {
      updates.push('data_hora_fechamento = NOW()');
    }

    values.push(id);

    await pool.query(
      `UPDATE pedidos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const pedido = await this.findById(id);
    if (!pedido) throw new Error('Erro ao atualizar pedido');

    return pedido;
  }

  async updateTotal(id: number): Promise<void> {
    await pool.query(
      `UPDATE pedidos SET total = (
        SELECT COALESCE(SUM(quantidade * preco_unitario), 0) 
        FROM itens_pedido 
        WHERE id_pedido = ?
      ) WHERE id = ?`,
      [id, id]
    );
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM pedidos WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Métodos para itens do pedido
  async addItem(
    id_pedido: number,
    id_produto: number,
    quantidade: number,
    preco_unitario: number,
    observacoes?: string
  ): Promise<ItemPedido> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario, observacoes, status_cozinha)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_pedido, id_produto, quantidade, preco_unitario, observacoes || null, 'recebido']
    );

    const [itemRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM itens_pedido WHERE id = ?',
      [result.insertId]
    );

    await this.updateTotal(id_pedido);

    return this.mapItemRow(itemRows[0]);
  }

  async updateItemStatus(id: number, status_cozinha: StatusCozinha): Promise<ItemPedido> {
    await pool.query(
      'UPDATE itens_pedido SET status_cozinha = ? WHERE id = ?',
      [status_cozinha, id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM itens_pedido WHERE id = ?',
      [id]
    );

    return this.mapItemRow(rows[0]);
  }

  async deleteItem(id: number): Promise<boolean> {
    const [itemRows] = await pool.query<RowDataPacket[]>(
      'SELECT id_pedido FROM itens_pedido WHERE id = ?',
      [id]
    );

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM itens_pedido WHERE id = ?',
      [id]
    );

    if (result.affectedRows > 0 && itemRows.length > 0) {
      await this.updateTotal(itemRows[0].id_pedido);
    }

    return result.affectedRows > 0;
  }

  private mapRow(row: any): Pedido {
    return {
      id: row.id,
      id_mesa: row.id_mesa,
      id_garcom: row.id_garcom,
      data_hora_abertura: new Date(row.data_hora_abertura),
      data_hora_fechamento: row.data_hora_fechamento ? new Date(row.data_hora_fechamento) : undefined,
      status: row.status,
      total: parseFloat(row.total),
      criado_em: new Date(row.criado_em),
    };
  }

  private mapItemRow(row: any): ItemPedido {
    return {
      id: row.id,
      id_pedido: row.id_pedido,
      id_produto: row.id_produto,
      quantidade: row.quantidade,
      preco_unitario: parseFloat(row.preco_unitario),
      observacoes: row.observacoes,
      status_cozinha: row.status_cozinha,
      criado_em: new Date(row.criado_em),
    };
  }
}
