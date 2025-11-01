import { pool } from '../config/database';
import { Produto } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class ProdutoRepository {
  async findById(id: number): Promise<Produto | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findAll(filtro?: { id_categoria?: number; disponivel?: boolean }): Promise<Produto[]> {
    let query = 'SELECT * FROM produtos WHERE 1=1';
    const values: any[] = [];

    if (filtro?.id_categoria) {
      query += ' AND id_categoria = ?';
      values.push(filtro.id_categoria);
    }
    if (filtro?.disponivel !== undefined) {
      query += ' AND disponivel = ?';
      values.push(filtro.disponivel);
    }

    query += ' ORDER BY nome ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, values);
    return rows.map(row => this.mapRow(row));
  }

  async create(
    nome: string,
    preco: number,
    id_categoria: number,
    descricao?: string,
    disponivel: boolean = true
  ): Promise<Produto> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO produtos (nome, descricao, preco, id_categoria, disponivel) VALUES (?, ?, ?, ?, ?)',
      [nome, descricao || null, preco, id_categoria, disponivel]
    );

    const produto = await this.findById(result.insertId);
    if (!produto) throw new Error('Erro ao criar produto');

    return produto;
  }

  async update(
    id: number,
    nome?: string,
    descricao?: string,
    preco?: number,
    id_categoria?: number,
    disponivel?: boolean
  ): Promise<Produto> {
    const updates: string[] = [];
    const values: any[] = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }
    if (preco !== undefined) {
      updates.push('preco = ?');
      values.push(preco);
    }
    if (id_categoria !== undefined) {
      updates.push('id_categoria = ?');
      values.push(id_categoria);
    }
    if (disponivel !== undefined) {
      updates.push('disponivel = ?');
      values.push(disponivel);
    }

    if (updates.length === 0) {
      const produto = await this.findById(id);
      if (!produto) throw new Error('Produto não encontrado');
      return produto;
    }

    values.push(id);

    await pool.query(
      `UPDATE produtos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const produto = await this.findById(id);
    if (!produto) throw new Error('Erro ao atualizar produto');

    return produto;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM produtos WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  private mapRow(row: any): Produto {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      preco: parseFloat(row.preco),
      disponivel: Boolean(row.disponivel),
      id_categoria: row.id_categoria,
      criado_em: new Date(row.criado_em),
    };
  }
}
