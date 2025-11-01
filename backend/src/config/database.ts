import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'feijuca_user',
  password: process.env.DB_PASSWORD || 'feijuca_password',
  database: process.env.DB_NAME || 'feijuca_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0, // ✅ nome correto da propriedade
});

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Conexão com banco de dados estabelecida');
    connection.release();
  } catch (error) {
    console.error('✗ Erro ao conectar com banco de dados:', error);
    process.exit(1);
  }
}
