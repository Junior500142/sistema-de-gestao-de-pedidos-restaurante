'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { pedidoService } from '@/services/pedidoService';
import { produtoService } from '@/services/produtoService';
import { ModalCardapio } from '@/components/ModalCardapio';
import { Temporizador } from '@/components/Temporizador';
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
  
  // Estados do modal de novo pedido
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [criandoPedido, setCriandoPedido] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [montado, setMontado] = useState(false);
  
  // Estados do modal de edição de item
  const [mostrarModalEdicaoItem, setMostrarModalEdicaoItem] = useState(false);
  const [itemEditando, setItemEditando] = useState<ItemPedido | null>(null);
  const [quantidadeEdicao, setQuantidadeEdicao] = useState(1);
  const [observacoesEdicao, setObservacoesEdicao] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Estado do modal de cardápio
  const [mostrarModalCardapio, setMostrarModalCardapio] = useState(false);

  // Evitar hydration - esperar montar no cliente
  useEffect(() => {
    setMontado(true);
  }, []);

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
      
      const pedidoCriado = await pedidoService.createPedido(Number(mesaSelecionada));
      
      for (const item of carrinho) {
        await pedidoService.addItemPedido(
          pedidoCriado.id,
          item.id_produto,
          item.quantidade,
          item.produto.preco,
          item.observacoes || undefined
        );
      }
      
      setMostrarModal(false);
      setMesaSelecionada('');
      setCarrinho([]);
      
      setTimeout(() => {
        carregarPedidos();
      }, 500);
      
      setErro('');
    } catch (error: any) {
      setErro(error.message || 'Erro ao criar pedido');
    } finally {
      setCriandoPedido(false);
    }
  };

  const handleAbrirEdicaoItem = (item: ItemPedido) => {
    setItemEditando(item);
    setQuantidadeEdicao(item.quantidade);
    setObservacoesEdicao(item.observacoes || '');
    setMostrarModalEdicaoItem(true);
  };

  const handleSalvarEdicaoItem = async () => {
    if (!itemEditando) return;

    try {
      setSalvandoEdicao(true);
      await pedidoService.updateItemPedido(
        itemEditando.id,
        quantidadeEdicao,
        observacoesEdicao || undefined
      );
      
      setMostrarModalEdicaoItem(false);
      setItemEditando(null);
      carregarPedidos();
      setErro('');
    } catch (error: any) {
      setErro(error.message || 'Erro ao atualizar item');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleExcluirItem = async (itemId: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      await pedidoService.deleteItemPedido(itemId);
      carregarPedidos();
      setErro('');
    } catch (error: any) {
      setErro(error.message || 'Erro ao excluir item');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Visualização por Pedidos Completos
  const obterStatusPedido = (pedido: Pedido): StatusCozinha => {
    if (!pedido.itens || pedido.itens.length === 0) return 'recebido';
    
    // Se todos os itens estão entregues, pedido está entregue
    const todosEntregues = pedido.itens.every(item => item.status_cozinha === 'entregue');
    if (todosEntregues) return 'entregue';
    
    // Se todos os itens estão prontos ou entregues, pedido está pronto
    const algunsProntos = pedido.itens.some(item => item.status_cozinha === 'pronto');
    const todosMinimoProntos = pedido.itens.every(item => 
      item.status_cozinha === 'pronto' || item.status_cozinha === 'entregue'
    );
    if (todosMinimoProntos && algunsProntos) return 'pronto';
    
    // Se algum item está em preparo, pedido está em preparo
    const algunsEmPreparo = pedido.itens.some(item => item.status_cozinha === 'em_preparo');
    if (algunsEmPreparo) return 'em_preparo';
    
    // Caso contrário, pedido está recebido
    return 'recebido';
  };

  const obterPedidosPorStatus = (status: StatusCozinha) => {
    return pedidos.filter(pedido => obterStatusPedido(pedido) === status);
  };

  const obterItemMaisAntigo = (pedido: Pedido): ItemPedido | null => {
    if (!pedido.itens || pedido.itens.length === 0) return null;
    
    const itensComTempo = pedido.itens.filter(item => item.iniciado_em);
    if (itensComTempo.length === 0) return null;
    
    return itensComTempo.reduce((maisAntigo, item) => {
      if (!maisAntigo.iniciado_em || !item.iniciado_em) return maisAntigo;
      return new Date(item.iniciado_em) < new Date(maisAntigo.iniciado_em) ? item : maisAntigo;
    });
  };

  const handleAvancarPedido = async (pedido: Pedido, statusAtual: StatusCozinha) => {
    const proximoStatus: Record<StatusCozinha, StatusCozinha> = {
      'recebido': 'em_preparo',
      'em_preparo': 'pronto',
      'pronto': 'entregue',
      'entregue': 'entregue',
    };

    try {
      const novoStatus = proximoStatus[statusAtual];
      
      // Atualiza todos os itens do pedido que ainda não atingiram o novo status
      const promessas = pedido.itens
        ?.filter(item => {
          const statusOrdem = ['recebido', 'em_preparo', 'pronto', 'entregue'];
          const ordemAtual = statusOrdem.indexOf(item.status_cozinha);
          const ordemNovo = statusOrdem.indexOf(novoStatus);
          return ordemAtual < ordemNovo;
        })
        .map(item => pedidoService.updateItemStatus(item.id, novoStatus)) || [];
      
      await Promise.all(promessas);
      carregarPedidos();
    } catch (error: any) {
      setErro(error.message || 'Erro ao avançar pedido');
    }
  };

  if (!montado || !usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Feijuca Gourmet</h1>
            <p className="text-gray-600">Bem-vindo, {usuario.nome}!</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAbrirModal}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition"
            >
              + Novo Pedido
            </button>
            <button
              onClick={() => setMostrarModalCardapio(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition"
            >
              📋 Cardápio
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{erro}</span>
            <button onClick={() => setErro('')} className="text-red-700 font-bold">✕</button>
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
                    {obterPedidosPorStatus(status).length} pedidos
                  </p>
                </div>

                <div className="p-4 space-y-3 min-h-96 overflow-y-auto">
                  {obterPedidosPorStatus(status).length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Nenhum pedido</p>
                  ) : (
                    obterPedidosPorStatus(status).map((pedido) => {
                      const itemMaisAntigo = obterItemMaisAntigo(pedido);
                      
                      return (
                        <div
                          key={pedido.id}
                          className="bg-gray-50 border-l-4 border-orange-500 p-4 rounded hover:shadow-md transition"
                        >
                          {/* Cabeçalho do Pedido */}
                          <div className="flex justify-between items-start mb-3 pb-3 border-b-2 border-orange-200">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🍽️</span>
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                  Pedido #{pedido.id}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Mesa {pedido.id_mesa}
                                </p>
                              </div>
                            </div>
                            {itemMaisAntigo && (
                              <Temporizador 
                                iniciado_em={itemMaisAntigo.iniciado_em} 
                                status={itemMaisAntigo.status_cozinha} 
                              />
                            )}
                          </div>

                          {/* Lista de Itens */}
                          <div className="mb-3 space-y-2">
                            {pedido.itens && pedido.itens.length > 0 ? (
                              pedido.itens.map((item, index) => (
                                <div key={item.id} className="flex items-start gap-2 text-sm">
                                  <span className="text-gray-400 font-mono text-xs mt-0.5">
                                    {index + 1}.
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-700">
                                        {item.quantidade}x
                                      </span>
                                      <span className="text-gray-800">
                                        {item.produto?.nome || `Produto #${item.id_produto}`}
                                      </span>
                                    </div>
                                    {item.observacoes && (
                                      <p className="text-xs text-yellow-700 italic ml-6 mt-1 bg-yellow-50 px-2 py-1 rounded">
                                        💬 {item.observacoes}
                                      </p>
                                    )}
                                  </div>
                                  {status !== 'entregue' && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleAbrirEdicaoItem(item)}
                                        className="text-blue-500 hover:text-blue-700 text-xs"
                                        title="Editar"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => handleExcluirItem(item.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                        title="Excluir"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm italic">Nenhum item no pedido</p>
                            )}
                          </div>

                          {/* Total do Pedido */}
                          <div className="pt-2 border-t border-gray-200 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Total:</span>
                              <span className="text-lg font-bold text-green-600">
                                R$ {pedido.total.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Botão Avançar Todo Pedido */}
                          {status !== 'entregue' && (
                            <button
                              onClick={() => handleAvancarPedido(pedido, status)}
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 px-3 rounded transition"
                            >
                              Avançar →
                            </button>
                          )}
                        </div>
                      );
                    })
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
            <div className="bg-orange-500 text-white p-4">
              <h2 className="text-2xl font-bold">Novo Pedido</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoverDoCarrinho(item.id_produto);
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-sm px-2"
                            disabled={criandoPedido}
                          >
                            Remover
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlterarQuantidade(item.id_produto, item.quantidade - 1);
                            }}
                            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                            disabled={criandoPedido}
                          >
                            -
                          </button>
                          <span className="font-bold">{item.quantidade}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlterarQuantidade(item.id_produto, item.quantidade + 1);
                            }}
                            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                            disabled={criandoPedido}
                          >
                            +
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Observações (opcional)"
                          value={item.observacoes}
                          onChange={(e) => handleAlterarObservacoes(item.id_produto, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full border rounded px-2 py-1 text-sm"
                          disabled={criandoPedido}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {carrinho.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

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

      {/* Modal Edição de Item */}
      {mostrarModalEdicaoItem && itemEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-blue-500 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">Editar Item</h2>
              <p className="text-sm opacity-90">{itemEditando.produto?.nome || `Item #${itemEditando.id}`}</p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Quantidade
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantidadeEdicao(Math.max(1, quantidadeEdicao - 1))}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded font-bold"
                    disabled={salvandoEdicao}
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold">{quantidadeEdicao}</span>
                  <button
                    onClick={() => setQuantidadeEdicao(quantidadeEdicao + 1)}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded font-bold"
                    disabled={salvandoEdicao}
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Total: <span className="font-bold text-green-600">
                    R$ {(quantidadeEdicao * itemEditando.preco_unitario).toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Observações
                </label>
                <textarea
                  value={observacoesEdicao}
                  onChange={(e) => setObservacoesEdicao(e.target.value)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações do item (opcional)"
                  disabled={salvandoEdicao}
                />
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={handleSalvarEdicaoItem}
                disabled={salvandoEdicao}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
              >
                {salvandoEdicao ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setMostrarModalEdicaoItem(false);
                  setItemEditando(null);
                }}
                disabled={salvandoEdicao}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cardápio */}
      <ModalCardapio 
        mostrar={mostrarModalCardapio} 
        onFechar={() => setMostrarModalCardapio(false)} 
      />
    </div>
  );
}