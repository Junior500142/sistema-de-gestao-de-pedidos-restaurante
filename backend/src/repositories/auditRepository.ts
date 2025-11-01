import { pool } from '../config/database';
import { AuditLog, AcaoAuditoria, EntidadeAuditoria } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class AuditRepository {
  async create(
    entidade: EntidadeAuditoria,
    entidade_id: number,
    acao: AcaoAuditoria,
    id_usuario?: number,
    dados_anteriores?: Record<string, any>
  ): Promise<AuditLog> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO audit_logs (id_usuario, entidade, entidade_id, acao, dados_anteriores)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id_usuario || null,
        entidade,
        entidade_id,
        acao,
        dados_anteriores ? JSON.stringify(dados_anteriores) : null,
      ]
    );

    const log = await this.findById(result.insertId);
    if (!log) throw new Error('Erro ao criar log de auditoria');

    return log;
  }

  async findById(id: number): Promise<AuditLog | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM audit_logs WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findAll(filtro?: {
    entidade?: EntidadeAuditoria;
    entidade_id?: number;
    id_usuario?: number;
    acao?: AcaoAuditoria;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const values: any[] = [];

    if (filtro?.entidade) {
      query += ' AND entidade = ?';
      values.push(filtro.entidade);
    }
    if (filtro?.entidade_id) {
      query += ' AND entidade_id = ?';
      values.push(filtro.entidade_id);
    }
    if (filtro?.id_usuario) {
      query += ' AND id_usuario = ?';
      values.push(filtro.id_usuario);
    }
    if (filtro?.acao) {
      query += ' AND acao = ?';
      values.push(filtro.acao);
    }

    query += ' ORDER BY criado_em DESC';

    if (filtro?.limit) {
      query += ' LIMIT ?';
      values.push(filtro.limit);
    }
    if (filtro?.offset) {
      query += ' OFFSET ?';
      values.push(filtro.offset);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, values);
    return rows.map(row => this.mapRow(row));
  }

  private mapRow(row: any): AuditLog {
    return {
      id: row.id,
      id_usuario: row.id_usuario,
      entidade: row.entidade,
      entidade_id: row.entidade_id,
      acao: row.acao,
      dados_anteriores: row.dados_anteriores ? JSON.parse(row.dados_anteriores) : undefined,
      criado_em: new Date(row.criado_em),
    };
  }
}
