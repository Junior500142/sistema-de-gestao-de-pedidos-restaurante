import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { testConnection } from './config/database';
import dotenv from 'dotenv';
// --- NOVOS IMPORTS ---
import { UsuarioRepository } from './repositories/usuarioRepository';
import bcrypt from 'bcryptjs';
// ---------------------

dotenv.config( );

const PORT = process.env.PORT || 3001;

const server = http.createServer(app );

// Configurar Socket.IO
// --- CORREÇÃO DO CORS AQUI ---
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://backend:3000'], // Permite ambas as origens
    credentials: true,
  },
} );
// --- FIM DA CORREÇÃO DO CORS ---

// Eventos Socket.IO
io.on('connection', (socket) => {
  console.log(`✓ Cliente conectado: ${socket.id}`);

  // Evento para atualizar status de pedido em tempo real
  socket.on('pedido:status-atualizado', (data) => {
    io.emit('pedido:status-atualizado', data);
  });

  // Evento para novo pedido
  socket.on('pedido:novo', (data) => {
    io.emit('pedido:novo', data);
  });

  // Evento para item do pedido atualizado
  socket.on('item:status-atualizado', (data) => {
    io.emit('item:status-atualizado', data);
  });

  // Evento para desconexão
  socket.on('disconnect', () => {
    console.log(`✗ Cliente desconectado: ${socket.id}`);
  });
});

// --- NOVA FUNÇÃO DE SEED ---
async function seedAdminUser() {
  const usuarioRepository = new UsuarioRepository();
  const emailAdmin = 'admin@feijuca.com';
  const senhaAdmin = 'admin123';

  // Verifica se o usuário admin já existe
  const adminExistente = await usuarioRepository.findByEmail(emailAdmin);

  if (!adminExistente) {
    console.log('Criando usuário admin inicial...');
    // O bcrypt.hash garante que a senha seja salva com o hash correto
    const senhaHash = await bcrypt.hash(senhaAdmin, 10);
    await usuarioRepository.create('Admin Feijuca', emailAdmin, senhaHash, 'admin');
    console.log('✓ Usuário admin criado com sucesso.');
  }
}
// --- FIM DA NOVA FUNÇÃO DE SEED ---

// Iniciar servidor
async function startServer() {
  try {
    // Testar conexão com banco de dados
    await testConnection();
    
    // Executar seed do admin
    await seedAdminUser(); // <- CHAMADA AQUI

    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Feijuca Gourmet - Backend Server    ║
╚════════════════════════════════════════╝

🚀 Servidor rodando em http://localhost:${PORT}
📡 Socket.IO ativo
✓ Banco de dados conectado

      ` );
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise Rejection Não Tratada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Exceção Não Capturada:', error);
  process.exit(1);
});
