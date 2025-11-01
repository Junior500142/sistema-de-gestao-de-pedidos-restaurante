# Resumo Técnico - Feijuca Gourmet

## Visão Geral do Projeto

O **Feijuca Gourmet** é um sistema completo de gestão de restaurante que substitui as tradicionais comandas de papel por uma interface digital moderna com Kanban interativo. O projeto foi desenvolvido com as melhores práticas de engenharia de software, utilizando tecnologias modernas e escaláveis.

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js/React)                 │
│  - Autenticação JWT                                          │
│  - Kanban Drag & Drop                                        │
│  - Socket.IO Client (Tempo Real)                             │
│  - Zustand Store (State Management)                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP + WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                Backend (Node.js/Express)                     │
│  - REST API                                                  │
│  - Socket.IO Server                                          │
│  - JWT Authentication                                        │
│  - Middleware de Autorização                                │
│  - Repositories Pattern                                      │
│  - Services Pattern                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL
┌────────────────────▼────────────────────────────────────────┐
│                 Banco de Dados (MySQL)                       │
│  - 8 Tabelas Principais                                      │
│  - Índices Otimizados                                        │
│  - Constraints de Integridade                                │
│  - Auditoria Completa                                        │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Linguagem**: TypeScript 5.3
- **Banco de Dados**: MySQL 8.0
- **Driver DB**: mysql2 3.6
- **Autenticação**: JWT + bcryptjs
- **Tempo Real**: Socket.IO 4.7
- **Qualidade**: ESLint, Prettier

### Frontend
- **Framework**: Next.js 14
- **Biblioteca UI**: React 18
- **Linguagem**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Axios 1.6
- **Estado**: Zustand 4.4
- **Tempo Real**: Socket.IO Client 4.7
- **Drag & Drop**: React Beautiful DnD (preparado)

### DevOps
- **Containerização**: Docker + Docker Compose
- **Orquestração**: Docker Compose
- **Ambiente**: Desenvolvimento local

## Estrutura de Pastas

```
feijuca-gourmet/
├── backend/                          # API Node.js + Express
│   ├── src/
│   │   ├── app.ts                   # Configuração Express
│   │   ├── server.ts                # Servidor + Socket.IO
│   │   ├── config/
│   │   │   └── database.ts          # Pool de conexões MySQL
│   │   ├── types/
│   │   │   └── index.ts             # Tipos TypeScript
│   │   ├── middlewares/
│   │   │   └── auth.ts              # JWT + Autorização
│   │   ├── repositories/            # Data Access Layer
│   │   │   ├── usuarioRepository.ts
│   │   │   ├── pedidoRepository.ts
│   │   │   ├── produtoRepository.ts
│   │   │   ├── mesaRepository.ts
│   │   │   ├── categoriaRepository.ts
│   │   │   └── auditRepository.ts
│   │   ├── services/                # Business Logic
│   │   │   ├── authService.ts
│   │   │   └── pedidoService.ts
│   │   ├── controllers/             # Request Handlers
│   │   │   ├── authController.ts
│   │   │   └── pedidoController.ts
│   │   └── routes/                  # API Routes
│   │       ├── authRoutes.ts
│   │       └── pedidoRoutes.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .eslintrc.json
│
├── web/                             # Frontend Next.js
│   ├── src/
│   │   ├── pages/
│   │   │   ├── _app.tsx            # App wrapper
│   │   │   ├── _document.tsx       # HTML document
│   │   │   ├── index.tsx           # Home redirect
│   │   │   ├── login.tsx           # Página de login
│   │   │   └── dashboard.tsx       # Kanban principal
│   │   ├── components/             # Componentes React
│   │   ├── services/               # API clients
│   │   │   ├── authService.ts
│   │   │   └── pedidoService.ts
│   │   ├── store/
│   │   │   └── authStore.ts        # Zustand store
│   │   ├── lib/
│   │   │   └── api.ts              # Axios instance
│   │   ├── types/
│   │   │   └── index.ts            # Tipos TypeScript
│   │   └── styles/
│   │       └── globals.css         # Tailwind + custom CSS
│   ├── public/                      # Assets estáticos
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── Dockerfile
│
├── migrations/                      # Scripts SQL
│   ├── 001_create_schema.sql       # DDL inicial
│   └── 002_seed_data.sql           # Dados iniciais
│
├── docker-compose.yml              # Orquestração
├── .env.example                    # Variáveis de ambiente
├── README.md                        # Documentação principal
├── GUIA_USO.md                     # Guia de uso
└── RESUMO_TECNICO.md              # Este arquivo
```

## Banco de Dados

### Tabelas

| Tabela | Descrição | Registros |
|--------|-----------|-----------|
| `usuarios_restaurante` | Usuários do sistema | 3 (seed) |
| `mesas` | Mesas do restaurante | 8 (seed) |
| `categorias` | Categorias de produtos | 6 (seed) |
| `produtos` | Itens do cardápio | 20 (seed) |
| `pedidos` | Pedidos/Comandas | Dinâmico |
| `itens_pedido` | Itens dentro de pedidos | Dinâmico |
| `pagamentos` | Registro de pagamentos | Dinâmico |
| `audit_logs` | Log de auditoria | Dinâmico |

### Relacionamentos

```
usuarios_restaurante (1) ──→ (N) pedidos
                         ──→ (N) audit_logs

mesas (1) ──→ (N) pedidos

categorias (1) ──→ (N) produtos

produtos (1) ──→ (N) itens_pedido

pedidos (1) ──→ (N) itens_pedido
           ──→ (N) pagamentos
           ──→ (N) audit_logs
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/users` - Criar usuário (admin only)

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/:id` - Buscar pedido específico
- `POST /api/pedidos` - Criar novo pedido
- `PATCH /api/pedidos/:id/status` - Atualizar status
- `DELETE /api/pedidos/:id` - Deletar pedido

### Itens do Pedido
- `POST /api/pedidos/:id_pedido/itens` - Adicionar item
- `PATCH /api/pedidos/itens/:id/status` - Atualizar status do item
- `DELETE /api/pedidos/itens/:id` - Deletar item

## Fluxo de Autenticação

```
1. Usuário acessa /login
2. Insere email e senha
3. Frontend envia POST /api/auth/login
4. Backend valida credenciais (bcrypt)
5. Backend gera JWT token
6. Frontend armazena token em localStorage
7. Frontend redireciona para /dashboard
8. Todas as requisições incluem token no header Authorization
9. Backend valida JWT em cada requisição
```

## Fluxo de Pedidos (Kanban)

```
┌─────────────────────────────────────────────────────────────┐
│ ATENDENTE                                                    │
│ 1. Cria novo pedido (POST /api/pedidos)                     │
│ 2. Adiciona itens (POST /api/pedidos/:id/itens)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ KANBAN - Coluna 1: RECEBIDO                                 │
│ Socket.IO notifica cozinha de novo item                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ COZINHA                                                      │
│ 1. Vê item em "Recebido"                                    │
│ 2. Clica "Próximo" → status = "em_preparo"                  │
│    (PATCH /api/pedidos/itens/:id/status)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ KANBAN - Coluna 2: EM PREPARAÇÃO                            │
│ Socket.IO notifica atendente do progresso                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ COZINHA                                                      │
│ 1. Item pronto                                              │
│ 2. Clica "Próximo" → status = "pronto"                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ KANBAN - Coluna 3: PRONTO                                   │
│ Socket.IO notifica atendente que item está pronto           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ ATENDENTE                                                    │
│ 1. Entrega item ao cliente                                  │
│ 2. Clica "Próximo" → status = "entregue"                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ KANBAN - Coluna 4: ENTREGUE                                 │
│ Pedido completo, aguardando pagamento                       │
└─────────────────────────────────────────────────────────────┘
```

## Padrões de Design Utilizados

### Backend
- **Repository Pattern**: Abstração de acesso a dados
- **Service Pattern**: Lógica de negócio separada
- **Controller Pattern**: Handlers de requisições
- **Middleware Pattern**: Autenticação e autorização
- **Dependency Injection**: Injeção de dependências

### Frontend
- **Component Pattern**: Componentes React reutilizáveis
- **Custom Hooks**: Lógica compartilhada
- **Store Pattern**: Gerenciamento de estado global (Zustand)
- **Service Pattern**: Abstração de chamadas HTTP

## Segurança

### Implementado
- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ JWT com expiração (24h)
- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ Auditoria completa de ações
- ✅ Autorização por tipo de usuário
- ✅ Proteção de rotas

### Recomendações para Produção
- [ ] Usar HTTPS/TLS
- [ ] Implementar rate limiting
- [ ] Adicionar CSRF protection
- [ ] Implementar 2FA
- [ ] Usar secrets manager para variáveis de ambiente
- [ ] Implementar backup automático
- [ ] Adicionar WAF (Web Application Firewall)
- [ ] Implementar logging centralizado

## Performance

### Otimizações Implementadas
- Connection pooling no MySQL
- Índices nas chaves primárias e estrangeiras
- Queries otimizadas com JOINs
- Cache no localStorage (frontend)
- Socket.IO para evitar polling
- Compressão de responses

### Métricas Esperadas
- Tempo de resposta: < 200ms
- Throughput: > 1000 req/s
- Conexões simultâneas: > 100
- Uptime: > 99%

## Testes

### Testes Manuais Recomendados

#### Autenticação
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Logout
- [ ] Acesso a rotas protegidas sem token
- [ ] Token expirado

#### Pedidos
- [ ] Criar novo pedido
- [ ] Adicionar itens ao pedido
- [ ] Atualizar status do item
- [ ] Deletar item
- [ ] Deletar pedido
- [ ] Atualizar status do pedido

#### Tempo Real
- [ ] Abrir dashboard em múltiplas abas
- [ ] Criar pedido em uma aba
- [ ] Verificar se aparece em tempo real em outra aba
- [ ] Atualizar status em uma aba
- [ ] Verificar atualização em outra aba

### Testes Automatizados (Futuro)
- [ ] Jest para testes unitários
- [ ] Supertest para testes de API
- [ ] Cypress para testes E2E

## Deployment

### Pré-requisitos
- Docker e Docker Compose
- 2GB RAM mínimo
- 10GB espaço em disco

### Passos
1. Clonar repositório
2. Configurar `.env` com credenciais de produção
3. Executar `docker-compose up -d`
4. Verificar logs: `docker-compose logs`

### Monitoramento
- Verificar saúde: `GET /health`
- Logs: `docker-compose logs -f`
- Métricas: Implementar Prometheus/Grafana

## Escalabilidade

### Próximas Fases
1. **Fase 2**: Painel administrativo completo
2. **Fase 3**: Relatórios e analytics
3. **Fase 4**: Aplicativo mobile
4. **Fase 5**: Integração com sistemas de pagamento
5. **Fase 6**: Microserviços

### Preparação para Escala
- Separar banco de dados em read replicas
- Implementar cache com Redis
- Usar load balancer (Nginx)
- Implementar message queue (RabbitMQ/Kafka)
- Containerizar com Kubernetes

## Manutenção

### Backup
```bash
# Backup do banco de dados
docker-compose exec mysql mysqldump -u root -p feijuca_db > backup.sql

# Restore
docker-compose exec -T mysql mysql -u root -p feijuca_db < backup.sql
```

### Logs
```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Atualizações
```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull

# Reiniciar
docker-compose up -d
```

## Conclusão

O **Feijuca Gourmet** é um sistema robusto, escalável e fácil de manter. Ele segue as melhores práticas de desenvolvimento, utiliza tecnologias modernas e está pronto para ser expandido com novas funcionalidades.

---

**Versão**: 1.0.0  
**Data**: Outubro 2025  
**Desenvolvido por**: Manus AI  
**Licença**: MIT
