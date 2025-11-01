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

// Interfaces de Modelos
export interface Usuario {
  id: number;
  nome: string;
  email: string;
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
  itens?: ItemPedido[];
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
  produto?: Produto;
}

export interface Pagamento {
  id: number;
  id_pedido: number;
  valor: number;
  metodo_pagamento: MetodoPagamento;
  data_hora: Date;
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

// Resposta padrão da API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Estado de autenticação
export interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setToken: (token: string) => void;
}
