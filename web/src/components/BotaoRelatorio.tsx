import React, { useState } from 'react';

const BotaoRelatorio: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const baixarRelatorio = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3333/pedidos/relatorio/exportar', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Falha ao gerar relatório');

      const blob = await response.blob();
 
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_pedidos_${new Date().toLocaleDateString()}.csv`);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('❌ Erro ao baixar relatório:', error);
      alert('Não foi possível gerar o relatório no momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={baixarRelatorio}
      disabled={loading}
      style={{
        padding: '10px 20px',
        backgroundColor: loading ? '#ccc' : '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {loading ? 'Gerando...' : '📊 Exportar Relatório (CSV)'}
    </button>
  );
};

export default BotaoRelatorio;