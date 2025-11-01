import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { pedidoService } from '@/services/pedidoService';
import { Pedido, ItemPedido, StatusCozinha } from '@/types';
import io from 'socket.io-client';

const statusColunas = ['recebido', 'em_preparo', 'pronto', 'entregue'] as const;

export default function Dashboard() {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!usuario) {
      router.push('/login');
      return;
    }

    carregarPedidos();

    // Conectar ao Socket.IO
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

    socket.on('pedido:novo', (_data) => {
      carregarPedidos();
    });

    socket.on('item:status-atualizado', (_data) => {
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
            <h1 className="text-3xl font-bold text-primary">Feijuca Gourmet</h1>
            <p className="text-gray-600">Bem-vindo, {usuario?.nome}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Sair
          </button>
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
                <div className="bg-primary text-white p-4 rounded-t-lg">
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
                        className="bg-gray-50 border-l-4 border-primary p-3 rounded cursor-move hover:shadow-md transition"
                        draggable
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">Pedido #{item.id_pedido}</span>
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded">
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
                            className="w-full bg-primary hover:bg-orange-600 text-white text-xs font-bold py-1 px-2 rounded mt-2 transition"
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
    </div>
  );
}
