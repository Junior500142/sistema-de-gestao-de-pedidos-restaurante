# Guia de Uso - Feijuca Gourmet

## Introdução

O **Feijuca Gourmet** é um sistema moderno de gestão de restaurante que substitui as tradicionais comandas de papel por uma interface digital com Kanban interativo. Este guia ajudará você a começar a usar o sistema.

## Começando

### 1. Iniciar o Projeto com Docker

```bash
# Clonar ou extrair o projeto
cd feijuca-gourmet

# Iniciar os containers
docker-compose up -d

# Aguarde alguns segundos para o banco de dados inicializar
```

### 2. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Banco de Dados**: localhost:3306

### 3. Fazer Login

Use as credenciais padrão:

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@feijuca.com | admin123 |
| Atendente | joao@feijuca.com | admin123 |
| Cozinha | maria@feijuca.com | admin123 |

## Funcionalidades Principais

### Dashboard (Kanban)

O dashboard exibe um Kanban com 4 colunas representando o fluxo de pedidos:

1. **Pedidos Recebidos** - Novos pedidos que chegaram
2. **Em Preparação** - Pedidos sendo preparados na cozinha
3. **Pronto** - Pedidos prontos para entrega
4. **Entregue** - Pedidos entregues ao cliente

#### Como usar:

1. Cada card representa um item de pedido
2. Clique em "Próximo →" para mover o item para o próximo status
3. Os itens se movem automaticamente entre as colunas
4. Atualizações em tempo real via Socket.IO

### Fluxo de Pedidos

```
Atendente cadastra → Cozinha vê no Kanban → Cozinha atualiza status → Atendente finaliza
```

#### Passo a passo:

1. **Atendente**: Cria um novo pedido selecionando a mesa
2. **Atendente**: Adiciona itens do cardápio ao pedido
3. **Cozinha**: Vê os novos itens na coluna "Pedidos Recebidos"
4. **Cozinha**: Move os itens para "Em Preparação" quando começar
5. **Cozinha**: Move para "Pronto" quando o item estiver pronto
6. **Atendente**: Move para "Entregue" quando entregar ao cliente
7. **Atendente**: Finaliza o pedido após pagamento

## API Endpoints

### Autenticação

```bash
# Login
POST /api/auth/login
{
  "email": "admin@feijuca.com",
  "senha": "admin123"
}

# Resposta
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "usuario": {
      "id": 1,
      "nome": "Admin",
      "email": "admin@feijuca.com",
      "tipo_usuario": "admin"
    }
  }
}
```

### Pedidos

```bash
# Listar todos os pedidos
GET /api/pedidos
Authorization: Bearer <token>

# Listar pedidos por status
GET /api/pedidos?status=em_preparo
Authorization: Bearer <token>

# Buscar pedido específico
GET /api/pedidos/1
Authorization: Bearer <token>

# Criar novo pedido
POST /api/pedidos
Authorization: Bearer <token>
{
  "id_mesa": 1
}

# Atualizar status do pedido
PATCH /api/pedidos/1/status
Authorization: Bearer <token>
{
  "status": "pronto"
}

# Deletar pedido
DELETE /api/pedidos/1
Authorization: Bearer <token>
```

### Itens do Pedido

```bash
# Adicionar item ao pedido
POST /api/pedidos/1/itens
Authorization: Bearer <token>
{
  "id_produto": 5,
  "quantidade": 2,
  "preco_unitario": 45.00,
  "observacoes": "Sem cebola"
}

# Atualizar status do item
PATCH /api/pedidos/itens/1/status
Authorization: Bearer <token>
{
  "status_cozinha": "em_preparo"
}

# Deletar item
DELETE /api/pedidos/itens/1
Authorization: Bearer <token>
```

## Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `usuarios_restaurante` | Usuários do sistema (atendente, cozinha, admin) |
| `mesas` | Mesas do restaurante |
| `categorias` | Categorias de produtos (bebidas, entradas, etc) |
| `produtos` | Itens do cardápio |
| `pedidos` | Pedidos/Comandas |
| `itens_pedido` | Itens dentro de cada pedido |
| `pagamentos` | Registro de pagamentos |
| `audit_logs` | Log de todas as ações do sistema |

## Troubleshooting

### Erro: "Conexão recusada no banco de dados"

```bash
# Verificar se os containers estão rodando
docker-compose ps

# Reiniciar os containers
docker-compose restart

# Verificar logs do MySQL
docker-compose logs mysql
```

### Erro: "Porta já em uso"

```bash
# Encontrar processo usando a porta
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :3306  # MySQL

# Matar o processo
kill -9 <PID>
```

### Erro: "Token inválido"

- Faça login novamente
- Limpe o localStorage do navegador
- Verifique se a variável `JWT_SECRET` está configurada

### Dados não aparecem após login

1. Verifique se o banco de dados foi inicializado
2. Verifique os logs: `docker-compose logs mysql`
3. Reinicie os containers: `docker-compose down && docker-compose up -d`

## Desenvolvimento Local (Sem Docker)

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

### Frontend

```bash
cd web

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

## Dicas de Uso

### Para Atendentes

1. **Criar Pedido**: Selecione a mesa e clique em "Novo Pedido"
2. **Adicionar Itens**: Use o cardápio para adicionar produtos
3. **Observações**: Adicione observações especiais (sem cebola, sem sal, etc)
4. **Finalizar**: Após pagamento, finalize o pedido

### Para Cozinha

1. **Monitorar**: Verifique constantemente o Kanban
2. **Atualizar Status**: Mova os itens conforme o progresso
3. **Observações**: Leia as observações dos itens
4. **Comunicação**: Use observações para comunicar com atendentes

### Para Admin

1. **Gerenciar Usuários**: Crie novos usuários com diferentes perfis
2. **Gerenciar Cardápio**: Adicione, edite ou remova produtos
3. **Gerenciar Mesas**: Configure as mesas do restaurante
4. **Visualizar Logs**: Acompanhe todas as ações do sistema

## Segurança

- **Senhas**: São armazenadas com hash bcrypt
- **Autenticação**: JWT com expiração de 24h
- **CORS**: Configurado para aceitar apenas requisições do frontend
- **Auditoria**: Todas as ações são registradas

## Performance

- **Cache**: Dados são cacheados no frontend
- **Socket.IO**: Atualizações em tempo real sem polling
- **Índices**: Banco de dados otimizado com índices
- **Paginação**: Implementada para grandes volumes de dados

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs: `docker-compose logs`
2. Consulte o README.md
3. Verifique a documentação da API

## Próximas Melhorias

- [ ] Painel administrativo completo
- [ ] Relatórios de vendas
- [ ] Sistema de mesas com status visual
- [ ] Integração com sistemas de pagamento
- [ ] Aplicativo mobile
- [ ] Notificações push
- [ ] Backup automático do banco de dados
- [ ] Testes automatizados

---

**Versão**: 1.0.0  
**Data**: Outubro 2025  
**Desenvolvido com**: Node.js, Express, React, Next.js, MySQL
