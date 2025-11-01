-- feijuca-gourmet/migrations/001_create_schema.sql

-- Tabela de Usuários (Atendente/Cozinha - login único com permissões simples)
CREATE TABLE usuarios_restaurante (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(300) NOT NULL, -- Armazenar o hash da senha
    tipo_usuario ENUM('atendente', 'cozinha', 'admin') NOT NULL DEFAULT 'atendente', -- Adicionado para controle de permissão
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mesas
CREATE TABLE mesas (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    capacidade INT NOT NULL,
    status ENUM('livre', 'ocupada', 'reservada') DEFAULT 'livre',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias de Produtos
CREATE TABLE categorias (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE produtos (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    id_categoria INT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT
);

-- Tabela de Pedidos (Comanda)
CREATE TABLE pedidos (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_mesa INT NOT NULL,
    id_garcom INT NOT NULL,
    data_hora_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_hora_fechamento DATETIME,
    status ENUM('aberto', 'em_preparo', 'pronto', 'pago', 'cancelado', 'finalizado') DEFAULT 'aberto',
    total DECIMAL(10,2) DEFAULT 0.00,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_mesa) REFERENCES mesas(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_garcom) REFERENCES usuarios_restaurante(id) ON DELETE RESTRICT
);

-- Tabela de Itens do Pedido
CREATE TABLE itens_pedido (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    -- status_cozinha é o que vai para o Kanban
    status_cozinha ENUM('recebido', 'em_preparo', 'pronto', 'entregue') DEFAULT 'recebido',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id) ON DELETE RESTRICT
);

-- Tabela de Pagamentos
CREATE TABLE pagamentos (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    metodo_pagamento ENUM('credito', 'debito', 'dinheiro', 'pix') NOT NULL,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE
);

-- Tabela de Auditoria (Logs)
CREATE TABLE audit_logs (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT, -- Quem fez a ação (NULL para ações automáticas)
    entidade VARCHAR(100) NOT NULL, -- ex: 'pedidos', 'usuarios_restaurante'
    entidade_id INT NOT NULL,
    acao VARCHAR(50) NOT NULL, -- ex: 'create', 'update', 'delete', 'status_change'
    dados_anteriores JSON,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios_restaurante(id) ON DELETE SET NULL
);
