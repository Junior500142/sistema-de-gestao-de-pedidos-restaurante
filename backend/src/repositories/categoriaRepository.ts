import { pool } from '../config/database';
import { Categoria } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class CategoriaRepository {
  async findById(id: number): Promise<Categoria | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findByNome(nome: string): Promise<Categoria | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categorias WHERE nome = ?',
      [nome]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findAll(): Promise<Categoria[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categorias ORDER BY nome ASC'
    );

    return rows.map(row => this.mapRow(row));
  }

  async create(nome: string): Promise<Categoria> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categorias (nome) VALUES (?)',
      [nome]
    );

    const categoria = await this.findById(result.insertId);
    if (!categoria) throw new Error('Erro ao criar categoria');

    return categoria;
  }

  async update(id: number, nome: string): Promise<Categoria> {
    await pool.query(
      'UPDATE categorias SET nome = ? WHERE id = ?',
      [nome, id]
    );

    const categoria = await this.findById(id);
    if (!categoria) throw new Error('Erro ao atualizar categoria');

    return categoria;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM categorias WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  private mapRow(row: any): Categoria {
    return {
      id: row.id,
      nome: row.nome,
      criado_em: new Date(row.criado_em),
    };
  }
}
