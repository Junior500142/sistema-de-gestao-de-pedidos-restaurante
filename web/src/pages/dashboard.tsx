import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { pedidoService } from '@/services/pedidoService';
import { produtoService } from '@/services/produtoService';
import { Pedido, ItemPedido, StatusCozinha, Produto } from '@/types';
import io from 'socket.io-client';

const statusColunas = ['recebido', 'em_preparo', 'pronto', 'entregue'] as const;

interface ItemCarrinho {
  id_produto: number;
  produto: Produto;
  quantidade: number;
  observacoes: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  // Estados do modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [criandoPedido, setCriandoPedido] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  useEffect(() => {
    if (!usuario) {
      router.push('/login');
      return;
    }

    carregarPedidos();

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

    socket.on('pedido:novo', () => {
      carregarPedidos();
    });

    socket.on('item:status-atualizado', () => {
      carregarPedidos();
    });

    return () => {
      socket.disconnect();
    };
  }, [usuario, router]);

  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const dados = await pedidoService.getAllPedidos();
      setPedidos(dados);
      setErro('');
    } catch (error: any) {
      setErro(error.message || 'Erro ao carregar pedidos');
    } finally {
      setCarregando(false);
    }
  };

  const carregarProdutos = async () => {
    try {
      setCarregandoProdutos(true);
      const dados = await produtoService.getAllProdutos({ disponivel: true });
      setProdutos(dados);
    } catch (error: any) {
      setErro(error.message || 'Erro ao carregar produtos');
    } finally {
      setCarregandoProdutos(false);
    }
  };

  const handleAbrirModal = () => {
    setMostrarModal(true);
    setCarrinho([]);
    setMesaSelecionada('');
    carregarProdutos();
  };

  const handleAdicionarAoCarrinho = (produto: Produto) => {
    const itemExistente = carrinho.find(item => item.id_produto === produto.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.id_produto === produto.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        id_produto: produto.id,
        produto,
        quantidade: 1,
        observacoes: ''
      }]);
    }
  };

  const handleRemoverDoCarrinho = (id_produto: number) => {
    setCarrinho(carrinho.filter(item => item.id_produto !== id_produto));
  };

  const handleAlterarQuantidade = (id_produto: number, quantidade: number) => {
    if (quantidade <= 0) {
      handleRemoverDoCarrinho(id_produto);
      return;
    }
    setCarrinho(carrinho.map(item => 
      item.id_produto === id_produto 
        ? { ...item, quantidade }
        : item
    ));
  };

  const handleAlterarObservacoes = (id_produto: number, observacoes: string) => {
    setCarrinho(carrinho.map(item => 
      item.id_produto === id_produto 
        ? { ...item, observacoes }
        : item
    ));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => 
      total + (item.produto.preco * item.quantidade), 0
    );
  };

  const handleCriarPedidoCompleto = async () => {
    if (!mesaSelecionada) {
      setErro('Selecione uma mesa');
      return;
    }

    if (carrinho.length === 0) {
      setErro('Adicione pelo menos um item ao pedido');
      return;
    }

    try {
      setCriandoPedido(true);
      
      // 1. Criar o pedido
      const pedidoCriado = await pedidoService.createPedido(Number(mesaSelecionada));
      
      // 2. Adicionar todos os itens
      for (const item of carrinho) {
        await pedidoService.addItemPedido(
          pedidoCriado.id,
          item.id_produto,
          item.quantidade,
          item.produto.preco,
          item.observacoes || undefined
        );
      }
      
      // 3. Fechar modal e recarregar
      setMostrarModal(false);
      setMesaSelecionada('');
      setCarrinho([]);
      carregarPedidos();
      setErro('');
    } catch (error: any) {
      setErro(error.message || 'Erro ao criar pedido');
    } finally {
      setCriandoPedido(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleStatusChange = async (itemId: number, novoStatus: StatusCozinha) => {
    try {
      await pedidoService.updateItemStatus(itemId, novoStatus);
      carregarPedidos();
    } catch (error: any) {
      setErro(error.message || 'Erro ao atualizar status');
    }
  };

  const obterItensPorStatus = (status: StatusCozinha) => {
    const itens: ItemPedido[] = [];
    pedidos.forEach((pedido) => {
      if (pedido.itens) {
        pedido.itens.forEach((item) => {
          if (item.status_cozinha === status) {
            itens.push({ ...item, id_pedido: pedido.id });
          }
        });
      }
    });
    return itens;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Feijuca Gourmet</h1>
            <p className="text-gray-600">Bem-vindo, {usuario?.nome}!</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAbrirModal}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition"
            >
              + Novo Pedido
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColunas.map((status) => (
              <div key={status} className="bg-white rounded-lg shadow">
                <div className="bg-orange-500 text-white p-4 rounded-t-lg">
                  <h2 className="text-lg font-bold capitalize">
                    {status === 'recebido' && 'Pedidos Recebidos'}
                    {status === 'em_preparo' && 'Em Preparação'}
                    {status === 'pronto' && 'Pronto'}
                    {status === 'entregue' && 'Entregue'}
                  </h2>
                  <p className="text-sm opacity-90">
                    {obterItensPorStatus(status).length} itens
                  </p>
                </div>
                <div className="p-4 space-y-3 min-h-96 overflow-y-auto">
                  {obterItensPorStatus(status).length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Nenhum item</p>
                  ) : (
                    obterItensPorStatus(status).map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 border-l-4 border-orange-500 p-3 rounded hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">Pedido #{item.id_pedido}</span>
                          <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                            Item #{item.id}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          Qtd: {item.quantidade}
                        </p>
                        {item.observacoes && (
                          <p className="text-xs text-gray-500 italic mb-2">
                            Obs: {item.observacoes}
                          </p>
                        )}
                        {status !== 'entregue' && (
                          <button
                            onClick={() => {
                              const proximoStatus: Record<StatusCozinha, StatusCozinha> = {
                                'recebido': 'em_preparo',
                                'em_preparo': 'pronto',
                                'pronto': 'entregue',
                                'entregue': 'entregue',
                              };
                              handleStatusChange(item.id, proximoStatus[status]);
                            }}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1 px-2 rounded mt-2 transition"
                          >
                            Próximo →
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Novo Pedido */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="bg-orange-500 text-white p-4">
              <h2 className="text-2xl font-bold">Novo Pedido</h2>
            </div>

            {/* Corpo do Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Seleção da Mesa */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Número da Mesa *
                </label>
                <input
                  type="number"
                  min="1"
                  value={mesaSelecionada}
                  onChange={(e) => setMesaSelecionada(e.target.value)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Digite o número da mesa"
                  disabled={criandoPedido}
                />
              </div>

              {/* Lista de Produtos */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Produtos Disponíveis</h3>
                
                {carregandoProdutos ? (
                  <p className="text-gray-500 text-center py-4">Carregando produtos...</p>
                ) : produtos.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum produto disponível</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="border rounded p-3 hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => handleAdicionarAoCarrinho(produto)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{produto.nome}</h4>
                            {produto.descricao && (
                              <p className="text-sm text-gray-600">{produto.descricao}</p>
                            )}
                          </div>
                          <span className="text-green-600 font-bold ml-2">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Carrinho */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Itens do Pedido ({carrinho.length})
                </h3>
                
                {carrinho.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded">
                    Nenhum item adicionado. Clique nos produtos acima para adicionar.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {carrinho.map((item) => (
                      <div key={item.id_produto} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{item.produto.nome}</h4>
                            <p className="text-sm text-gray-600">
                              R$ {item.produto.preco.toFixed(2)} x {item.quantidade} = 
                              <span className="font-bold text-green-600 ml-1">
                                R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoverDoCarrinho(item.id_produto)}
                            className="text-red-500 hover:text-red-700 font-bold"
                            disabled={criandoPedido}
                          >
                            ✕
                          </button>
                        </div>
                        
                        {/* Quantidade */}
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => handleAlterarQuantidade(item.id_produto, item.quantidade - 1)}
                            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                            disabled={criandoPedido}
                          >
                            -
                          </button>
                          <span className="font-bold">{item.quantidade}</span>
                          <button
                            onClick={() => handleAlterarQuantidade(item.id_produto, item.quantidade + 1)}
                            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                            disabled={criandoPedido}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Observações */}
                        <input
                          type="text"
                          placeholder="Observações (opcional)"
                          value={item.observacoes}
                          onChange={(e) => handleAlterarObservacoes(item.id_produto, e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          disabled={criandoPedido}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              {carrinho.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="border-t p-4 flex gap-3">
              <button
                onClick={handleCriarPedidoCompleto}
                disabled={criandoPedido || !mesaSelecionada || carrinho.length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition"
              >
                {criandoPedido ? 'Criando Pedido...' : `Criar Pedido (${carrinho.length} itens)`}
              </button>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setMesaSelecionada('');
                  setCarrinho([]);
                  setErro('');
                }}
                disabled={criandoPedido}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}