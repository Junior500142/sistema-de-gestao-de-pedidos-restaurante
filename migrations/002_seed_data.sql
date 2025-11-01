-- migrations/002_seed_data.sql
-- Dados iniciais para o Feijuca Gourmet

-- Inserir usuário admin (senha: admin123 - hash bcrypt)
INSERT INTO usuarios_restaurante (nome, email, senha, tipo_usuario) VALUES
('Admin Feijuca', 'admin@feijuca.com', '$2a$10$YIjlrPNoS0.OtIUVUVXh2eS8kLHSVeJ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 'admin'),
('João Atendente', 'joao@feijuca.com', '$2a$10$YIjlrPNoS0.OtIUVUVXh2eS8kLHSVeJ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 'atendente'),
('Maria Cozinha', 'maria@feijuca.com', '$2a$10$YIjlrPNoS0.OtIUVUVXh2eS8kLHSVeJ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 'cozinha');

-- Inserir mesas
INSERT INTO mesas (numero, capacidade, status) VALUES
(1, 2, 'livre'),
(2, 2, 'livre'),
(3, 4, 'livre'),
(4, 4, 'livre'),
(5, 6, 'livre'),
(6, 6, 'livre'),
(7, 8, 'livre'),
(8, 8, 'livre');

-- Inserir categorias
INSERT INTO categorias (nome) VALUES
('Bebidas'),
('Entradas'),
('Pratos Principais'),
('Acompanhamentos'),
('Sobremesas'),
('Bebidas Alcoólicas');

-- Inserir produtos
INSERT INTO produtos (nome, descricao, preco, id_categoria, disponivel) VALUES
-- Bebidas
('Água', 'Água mineral', 3.00, 1, TRUE),
('Refrigerante', 'Refrigerante 350ml', 5.00, 1, TRUE),
('Suco Natural', 'Suco de laranja natural', 8.00, 1, TRUE),
('Café', 'Café coado', 4.00, 1, TRUE),

-- Entradas
('Bruschetta', 'Pão tostado com tomate e manjericão', 15.00, 2, TRUE),
('Camarão à Milanesa', 'Camarão empanado e frito', 28.00, 2, TRUE),
('Tábua de Queijos', 'Seleção de queijos variados', 35.00, 2, TRUE),

-- Pratos Principais
('Frango à Parmesã', 'Peito de frango com molho de tomate e queijo', 45.00, 3, TRUE),
('Bife à Milanesa', 'Bife de carne vermelha empanado', 55.00, 3, TRUE),
('Salmão Grelhado', 'Filé de salmão com temperos especiais', 65.00, 3, TRUE),
('Pasta à Carbonara', 'Massa com molho cremoso e bacon', 38.00, 3, TRUE),
('Risoto de Cogumelos', 'Risoto cremoso com cogumelos frescos', 42.00, 3, TRUE),

-- Acompanhamentos
('Batata Frita', 'Batata frita crocante', 12.00, 4, TRUE),
('Arroz Branco', 'Arroz branco cozido', 8.00, 4, TRUE),
('Brócolis Grelhado', 'Brócolis com azeite e alho', 10.00, 4, TRUE),

-- Sobremesas
('Brigadeiro', 'Brigadeiro caseiro', 8.00, 5, TRUE),
('Pavê', 'Pavê de chocolate', 12.00, 5, TRUE),
('Sorvete', 'Sorvete de baunilha', 10.00, 5, TRUE),

-- Bebidas Alcoólicas
('Vinho Tinto', 'Vinho tinto reserva', 45.00, 6, TRUE),
('Cerveja', 'Cerveja gelada 600ml', 12.00, 6, TRUE),
('Chopp', 'Chopp artesanal', 15.00, 6, TRUE);
