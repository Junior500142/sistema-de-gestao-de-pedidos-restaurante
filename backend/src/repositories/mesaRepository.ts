import { pool } from '../config/database';
import { Mesa, StatusMesa } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class MesaRepository {
  async findById(id: number): Promise<Mesa | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM mesas WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findByNumero(numero: number): Promise<Mesa | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM mesas WHERE numero = ?',
      [numero]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findAll(filtro?: { status?: StatusMesa }): Promise<Mesa[]> {
    let query = 'SELECT * FROM mesas WHERE 1=1';
    const values: any[] = [];

    if (filtro?.status) {
      query += ' AND status = ?';
      values.push(filtro.status);
    }

    query += ' ORDER BY numero ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, values);
    return rows.map(row => this.mapRow(row));
  }

  async create(numero: number, capacidade: number, status: StatusMesa = 'livre'): Promise<Mesa> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO mesas (numero, capacidade, status) VALUES (?, ?, ?)',
      [numero, capacidade, status]
    );

    const mesa = await this.findById(result.insertId);
    if (!mesa) throw new Error('Erro ao criar mesa');

    return mesa;
  }

  async updateStatus(id: number, status: StatusMesa): Promise<Mesa> {
    await pool.query(
      'UPDATE mesas SET status = ? WHERE id = ?',
      [status, id]
    );

    const mesa = await this.findById(id);
    if (!mesa) throw new Error('Erro ao atualizar mesa');

    return mesa;
  }

  async update(id: number, numero?: number, capacidade?: number): Promise<Mesa> {
    const updates: string[] = [];
    const values: any[] = [];

    if (numero !== undefined) {
      updates.push('numero = ?');
      values.push(numero);
    }
    if (capacidade !== undefined) {
      updates.push('capacidade = ?');
      values.push(capacidade);
    }

    if (updates.length === 0) {
      const mesa = await this.findById(id);
      if (!mesa) throw new Error('Mesa não encontrada');
      return mesa;
    }

    values.push(id);

    await pool.query(
      `UPDATE mesas SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const mesa = await this.findById(id);
    if (!mesa) throw new Error('Erro ao atualizar mesa');

    return mesa;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM mesas WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  private mapRow(row: any): Mesa {
    return {
      id: row.id,
      numero: row.numero,
      capacidade: row.capacidade,
      status: row.status,
      criado_em: new Date(row.criado_em),
    };
  }
}
