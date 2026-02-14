import { pool } from '../config/database';
import { Usuario, TipoUsuario } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class UsuarioRepository {
  private mapRow(row: any): Usuario {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo_usuario: row.tipo_usuario,
      status: row.status, 
      criado_em: row.criado_em
    };
  }

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
      'SELECT * FROM usuarios_restaurante ORDER BY criado_em DESC'
    );
    return rows.map(row => this.mapRow(row));
  }

  async findPending(): Promise<Usuario[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM usuarios_restaurante WHERE status = 'pendente' ORDER BY criado_em DESC"
    );
    return rows.map(row => this.mapRow(row));
  }

  async create(nome: string, email: string, senhaHash: string, tipo_usuario: TipoUsuario = 'atendente'): Promise<Usuario> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO usuarios_restaurante (nome, email, senha, tipo_usuario, status) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, tipo_usuario, 'pendente']
    );

    const novoUsuario = await this.findById(result.insertId);
    if (!novoUsuario) throw new Error('Erro ao criar usuário');
    return novoUsuario;
  }

  async updateStatus(id: number, status: 'ativo' | 'bloqueado'): Promise<void> {
    await pool.query(
      'UPDATE usuarios_restaurante SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM usuarios_restaurante WHERE id = ?', [id]);
  }
}
