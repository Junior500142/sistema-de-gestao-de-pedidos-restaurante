import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';

export default function Usuarios() {
  const { usuario } = useAuthStore();
  const router = useRouter();
  const [usuariosPendentes, setUsuariosPendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario || usuario.tipo_usuario !== 'admin') {
      router.push('/dashboard');
      return;
    }
    carregarUsuariosPendentes();
  }, [usuario]);

  const carregarUsuariosPendentes = async () => {
    try {
      const response = await api.get('/auth/pending-users');
      setUsuariosPendentes(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setCarregando(false);
    }
  };

  const aprovarUsuario = async (id: number) => {
    try {
      await api.patch(`/auth/approve-user/${id}`);
      setUsuariosPendentes(usuariosPendentes.filter((u: any) => u.id !== id));
      alert('Usuário aprovado com sucesso!');
    } catch (error) {
      alert('Erro ao aprovar usuário.');
    }
  };

  const rejeitarUsuario = async (id: number) => {
    if (!confirm('Tem certeza que deseja rejeitar este cadastro?')) return;
    try {
      await api.delete(`/auth/reject-user/${id}`);
      setUsuariosPendentes(usuariosPendentes.filter((u: any) => u.id !== id));
    } catch (error) {
      alert('Erro ao rejeitar usuário.');
    }
  };

  if (carregando) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Usuários</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Voltar ao Dashboard
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-700">Solicitações Pendentes</h2>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase">Nome</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase">Email</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase">Função</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase">Data</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600 uppercase text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuariosPendentes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Nenhuma solicitação pendente no momento.
                </td>
              </tr>
            ) : (
              usuariosPendentes.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.tipo_usuario === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      u.tipo_usuario === 'cozinha' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.tipo_usuario.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => aprovarUsuario(u.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => rejeitarUsuario(u.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
