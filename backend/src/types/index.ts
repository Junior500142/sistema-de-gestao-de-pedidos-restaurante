// Tipos de usuário
export type TipoUsuario = 'atendente' | 'cozinha' | 'admin';

// Status do pedido
export type StatusPedido = 'aberto' | 'em_preparo' | 'pronto' | 'pago' | 'cancelado' | 'finalizado';

// Status da cozinha (para itens do pedido)
export type StatusCozinha = 'recebido' | 'em_preparo' | 'pronto' | 'entregue';

// Status da mesa
export type StatusMesa = 'livre' | 'ocupada' | 'reservada';

// Método de pagamento
export type MetodoPagamento = 'credito' | 'debito' | 'dinheiro' | 'pix';

// Ação de auditoria
export type AcaoAuditoria = 'create' | 'update' | 'delete' | 'status_change';

// Entidade de auditoria
export type EntidadeAuditoria = 'usuarios_restaurante' | 'pedidos' | 'itens_pedido' | 'mesas' | 'produtos' | 'categorias' | 'pagamentos';

// Interfaces de Modelos
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  tipo_usuario: TipoUsuario;
  criado_em: Date;
}

export interface Mesa {
  id: number;
  numero: number;
  capacidade: number;
  status: StatusMesa;
  criado_em: Date;
}

export interface Categoria {
  id: number;
  nome: string;
  criado_em: Date;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  disponivel: boolean;
  id_categoria: number;
  criado_em: Date;
}

export interface Pedido {
  id: number;
  id_mesa: number;
  id_garcom: number;
  data_hora_abertura: Date;
  data_hora_fechamento?: Date;
  status: StatusPedido;
  total: number;
  criado_em: Date;
}

export interface ItemPedido {
  id: number;
  id_pedido: number;
  id_produto: number;
  quantidade: number;
  preco_unitario: number;
  observacoes?: string;
  status_cozinha: StatusCozinha;
  criado_em: Date;
}

export interface Pagamento {
  id: number;
  id_pedido: number;
  valor: number;
  metodo_pagamento: MetodoPagamento;
  data_hora: Date;
}

export interface AuditLog {
  id: number;
  id_usuario?: number;
  entidade: EntidadeAuditoria;
  entidade_id: number;
  acao: AcaoAuditoria;
  dados_anteriores?: Record<string, any>;
  criado_em: Date;
}

// Interfaces de Requisição/Resposta
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Omit<Usuario, 'senha'>;
}

export interface JWTPayload {
  id: number;
  email: string;
  tipo_usuario: TipoUsuario;
}

// Resposta padrão da API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Paginação
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
