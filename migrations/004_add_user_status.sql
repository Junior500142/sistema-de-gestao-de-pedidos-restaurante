-- Adicionar coluna de status na tabela de usuários
ALTER TABLE usuarios_restaurante 
ADD COLUMN status ENUM('pendente', 'ativo', 'bloqueado') NOT NULL DEFAULT 'pendente';

-- Garantir que o admin padrão esteja ativo
UPDATE usuarios_restaurante SET status = 'ativo' WHERE email = 'admin@feijuca.com';
