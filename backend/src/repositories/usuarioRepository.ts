import { pool } from '../config/database';
import { Usuario, TipoUsuario } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class UsuarioRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios_restaurante WHERE email = ?',
      [email]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findById(id: number): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios_restaurante WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findAll(): Promise<Usuario[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nome, email, tipo_usuario, criado_em FROM usuarios_restaurante ORDER BY criado_em DESC'
    );

    return rows.map(row => this.mapRow(row));
  }

  async create(nome: string, email: string, senhaHash: string, tipo_usuario: TipoUsuario = 'atendente'): Promise<Usuario> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO usuarios_restaurante (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, tipo_usuario]
    );

    const usuario = await this.findById(result.insertId);
    if (!usuario) throw new Error('Erro ao criar usuário');

    return usuario;
  }

  async update(id: number, nome?: string, email?: string, tipo_usuario?: TipoUsuario): Promise<Usuario> {
    const updates: string[] = [];
    const values: any[] = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (tipo_usuario !== undefined) {
      updates.push('tipo_usuario = ?');
      values.push(tipo_usuario);
    }

    if (updates.length === 0) {
      const usuario = await this.findById(id);
      if (!usuario) throw new Error('Usuário não encontrado');
      return usuario;
    }

    values.push(id);

    await pool.query(
      `UPDATE usuarios_restaurante SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const usuario = await this.findById(id);
    if (!usuario) throw new Error('Erro ao atualizar usuário');

    return usuario;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM usuarios_restaurante WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  private mapRow(row: any): Usuario {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo_usuario: row.tipo_usuario,
      criado_em: new Date(row.criado_em),
    };
  }
}
