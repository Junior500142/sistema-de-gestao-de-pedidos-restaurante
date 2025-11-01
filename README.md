# Feijuca Gourmet - Sistema de Gestão de Restaurante

Um sistema moderno de gestão de restaurante que substitui as tradicionais comandas de papel por uma interface digital com Kanban interativo (drag & drop).

## Visão Geral

O **Feijuca Gourmet** é uma solução completa para gerenciar pedidos, cardápio, mesas e usuários de um restaurante. O sistema oferece:

- **Interface Kanban**: Visualização em tempo real de pedidos com status (Pedido → Produção → Entrega → Finalizado)
- **Autenticação JWT**: Login seguro com diferentes perfis de usuário (Atendente, Cozinha, Admin)
- **Painel Administrativo**: Gerenciamento de produtos, categorias, mesas e usuários
- **Atualizações em Tempo Real**: Socket.IO para sincronização instantânea entre usuários
- **Banco de Dados Relacional**: MySQL com migrations automáticas
- **Containerização**: Docker e Docker Compose para fácil deployment

## Stack Tecnológico

### Backend
- **Node.js** com **Express**
- **TypeScript** para tipagem estática
- **MySQL** com driver `mysql2`
- **Socket.IO** para comunicação em tempo real
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **Next.js** (React) com **TypeScript**
- **React Beautiful DnD** ou **dnd-kit** para drag & drop
- **Axios** para chamadas HTTP
- **Socket.IO Client** para tempo real
- **Tailwind CSS** para estilização

### DevOps
- **Docker** e **Docker Compose**
- **ESLint** e **Prettier** para qualidade de código
- **Husky** para pre-commit hooks

## Estrutura do Projeto

```
feijuca-gourmet/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── app.ts          # Configuração da aplicação
│   │   ├── server.ts       # Servidor e Socket.IO
│   │   ├── routes/         # Rotas da API
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── services/       # Serviços e regras
│   │   ├── repositories/   # Queries SQL
│   │   ├── middlewares/    # Middlewares (auth, etc)
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilitários
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── web/                     # Frontend Next.js
│   ├── src/
│   │   ├── pages/          # Páginas Next.js
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Chamadas API
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # CSS/Tailwind
│   │   └── lib/            # Utilitários
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
├── migrations/              # Scripts SQL de inicialização
├── docker-compose.yml       # Orquestração de containers
├── .env.example            # Variáveis de ambiente
└── README.md               # Este arquivo
```

## Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados
- Ou: Node.js 16+, npm/yarn e MySQL 8.0+

### Com Docker (Recomendado)

1. Clone o repositório:
```bash
git clone <repository-url>
cd feijuca-gourmet
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Acesse a aplicação:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MySQL: localhost:3306

### Sem Docker (Desenvolvimento Local)

#### Backend

1. Entre na pasta do backend:
```bash
cd backend
npm install
```

2. Configure o banco de dados:
```bash
# Crie um banco de dados MySQL chamado feijuca_db
mysql -u root -p < ../migrations/001_create_schema.sql
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor:
```bash
npm run dev
```

#### Frontend

1. Entre na pasta do web:
```bash
cd web
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Credenciais Padrão

Após a inicialização, você pode usar as seguintes credenciais (se houver seed de dados):

- **Email**: admin@feijuca.com
- **Senha**: admin123

## Funcionalidades Principais

### 1. Autenticação
- Login com email e senha
- Geração de JWT token
- Diferentes perfis: Atendente, Cozinha, Admin

### 2. Gestão de Pedidos (Kanban)
- Visualização de pedidos em 4 colunas: Pedido → Produção → Entrega → Finalizado
- Drag & drop para mover itens entre status
- Edição e exclusão de pedidos
- Log de auditoria de todas as ações

### 3. Painel Administrativo
- **Produtos**: CRUD de itens do cardápio
- **Categorias**: Organização de produtos
- **Mesas**: Gerenciamento de mesas e capacidade
- **Usuários**: Criação e gerenciamento de usuários
- **Relatórios**: Visualização de pedidos e vendas

### 4. Tempo Real
- Atualizações instantâneas via Socket.IO
- Múltiplos usuários veem as mesmas mudanças em tempo real
- Notificações de novos pedidos

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro (admin only)
- `POST /api/auth/refresh` - Renovar token

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `PATCH /api/pedidos/:id/status` - Atualizar status
- `DELETE /api/pedidos/:id` - Deletar pedido

### Produtos
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto (admin only)
- `PUT /api/produtos/:id` - Atualizar produto (admin only)
- `DELETE /api/produtos/:id` - Deletar produto (admin only)

### Mesas
- `GET /api/mesas` - Listar mesas
- `POST /api/mesas` - Criar mesa (admin only)
- `PATCH /api/mesas/:id/status` - Atualizar status

### Usuários
- `GET /api/usuarios` - Listar usuários (admin only)
- `POST /api/usuarios` - Criar usuário (admin only)
- `PUT /api/usuarios/:id` - Atualizar usuário (admin only)
- `DELETE /api/usuarios/:id` - Deletar usuário (admin only)

## Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis.

## Scripts NPM

### Backend
```bash
npm run dev      # Inicia em modo desenvolvimento
npm run build    # Compila TypeScript
npm run start    # Inicia em produção
npm run lint     # Verifica código
npm run format   # Formata código
```

### Frontend
```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Compila para produção
npm run start    # Inicia servidor de produção
npm run lint     # Verifica código
```

## Banco de Dados

### Tabelas Principais
- `usuarios_restaurante` - Usuários do sistema
- `mesas` - Mesas do restaurante
- `categorias` - Categorias de produtos
- `produtos` - Itens do cardápio
- `pedidos` - Pedidos/Comandas
- `itens_pedido` - Itens dentro de cada pedido
- `pagamentos` - Registro de pagamentos
- `audit_logs` - Log de todas as ações

## Logs e Auditoria

Todas as ações (create, update, delete, status_change) são registradas na tabela `audit_logs` com:
- Usuário que realizou a ação
- Tipo de entidade afetada
- Tipo de ação
- Dados anteriores (para rastreamento)
- Timestamp

## Troubleshooting

### Erro de conexão com MySQL
- Verifique se o container MySQL está rodando: `docker-compose ps`
- Verifique as credenciais em `.env`
- Aguarde alguns segundos para o MySQL inicializar

### Porta já em uso
- Backend (3001): `lsof -i :3001` e `kill -9 <PID>`
- Frontend (3000): `lsof -i :3000` e `kill -9 <PID>`
- MySQL (3306): `lsof -i :3306` e `kill -9 <PID>`

### Erro de migrations
- Verifique se o arquivo SQL está em `./migrations/`
- Reinicie os containers: `docker-compose down && docker-compose up -d`

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -m 'Adiciona minha feature'`
3. Push para a branch: `git push origin feature/minha-feature`
4. Abra um Pull Request

## Licença

MIT License - veja LICENSE para detalhes.

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
