import React, { useState } from "react";
import { DollarSign, TrendingDown, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useFinancas } from '../hooks/useFinancas';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import { useAuth } from '../AuthContext';

// Função de formatação para R$
const formatarMoeda = (valor) => {
  const numValor = parseFloat(valor) || 0;
  return numValor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const Card = ({ title, icon, value }) => (
  <div className="bg-[#1e293b] p-5 rounded-xl shadow-lg flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);


export default function Financas() {
  const { transacoes, loading, erro, summary, adicionarTransacao, deletarTransacao, atualizarTransacao } = useFinancas();
  const { currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // Função de Salvar 
  const handleSaveTransaction = async (data) => {
    try {
      await adicionarTransacao(data);
      setShowAddModal(false);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      throw new Error(error.message || "Erro desconhecido ao salvar.");
    }
  };


  // Função para abrir o modal de edição
  const handleEditClick = (transaction) => {
    setTransactionToEdit(transaction);
    setShowEditModal(true);
  };

  // Função para confirmar e deletar (usa a função do hook)
  const handleDeleteClick = (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta transação?")) {
      deletarTransacao(id).catch(err => {
        alert("Erro ao deletar: " + err.message);
      });
    }
  };

  if (loading) {
    return <div className="p-6 text-white text-center">Carregando dados financeiros...</div>;
  }

  if (erro) {
    return (
      <div className="p-6 text-white text-center">
        <h1 className="text-xl text-red-500 mb-4">Erro ao carregar dados financeiros.</h1>
        <p className="text-red-400">Mensagem: {erro}</p>
        <p className="mt-4 text-sm text-gray-400">Verifique o console para detalhes sobre a necessidade de índices ou permissões.</p>
      </div>
    );
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const lucroPorMes = Array(12).fill(0);
  let transacoesRecentes = [];

  if (Array.isArray(transacoes)) {
    transacoes.forEach(t => {
      if (t.data && typeof t.data.toDate === 'function') {
        try {
          const mes = t.data.toDate().getMonth(); // 0-11
          const valor = t.tipo === 'Receita' ? (t.valor || 0) : -(t.valor || 0);
          if (mes >= 0 && mes <= 11) {
            lucroPorMes[mes] += valor;
          }
        } catch (e) {
          console.warn("Transação ignorada por erro de data (toDate):", t);
        }
      }
    });

    transacoesRecentes = transacoes
      .filter(t => t.data && typeof t.data.seconds === 'number') 
      .sort((a, b) => (b.data.seconds || 0) - (a.data.seconds || 0)) 
      .slice(0, 5);
  }

  const maxAbsLucro = Math.max(...lucroPorMes.map(Math.abs), 1); 
  const maxYLabel = formatarMoeda(maxAbsLucro);
  const minYLabel = formatarMoeda(-maxAbsLucro);

  return (
    <div className="p-6 bg-[#0f172a] text-white min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão Financeira</h1>
          <p className="text-gray-400">Acompanhe receitas, despesas e lucratividade.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
          aria-label="Adicionar transação"
        >
          + Adicionar Transação
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Receita Total" icon={<TrendingUp className="text-green-500" />} value={formatarMoeda(summary.receitaTotal)} />
        <Card title="Despesas Totais" icon={<TrendingDown className="text-red-500" />} value={formatarMoeda(summary.despesaTotal)} />
        <Card title="Lucro Líquido" icon={<DollarSign className={summary.lucroLiquido >= 0 ? 'text-green-500' : 'text-red-500'} />} value={formatarMoeda(summary.lucroLiquido)} />
      </div>

      {/* Seção Gráfico e Transações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Tendência */}
        <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Tendência de Lucro Líquido (Mês)</h2>
          <div className="h-56 sm:h-64 lg:h-72 flex flex-col justify-end relative pt-6 pb-8">

            {/* Labels Y e Linha Zero */}
            <span className="absolute left-0 top-0 text-xs text-gray-400">{maxYLabel}</span>
            <span className="absolute left-0 bottom-6 text-xs text-gray-400">{minYLabel}</span>
            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">R$ 0</span>
            <div className="absolute left-10 right-0 h-px bg-gray-600 top-1/2"></div>

            {/* Container das Barras */}
            <div className="flex h-full items-center justify-around ml-12 sm:ml-10 px-2">
              {lucroPorMes.map((lucro, index) => {
                const percent = (Math.abs(lucro) / maxAbsLucro);
                const barHeightPercent = Math.min(percent * 45, 45);
                const isPositive = lucro >= 0;
                const colorClass = isPositive ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400';
                const tooltipText = `${meses[index]}: ${formatarMoeda(lucro)}`;

                return (
                  <div key={meses[index]} className="flex flex-col items-center h-full w-full relative group">
                    {/* Barra (Positiva ou Negativa) */}
                    <div
                      className={`w-3 sm:w-4 rounded-md transition-all duration-300 ${colorClass}`}
                      style={{
                        height: `${barHeightPercent}%`,
                        transform: `translateY(${isPositive ? '-50%' : '50%'}) scaleY(${isPositive ? 1 : -1})`,
                        position: 'absolute',
                        bottom: '50%',
                      }}
                      title={tooltipText}
                    >
                      {/* Tooltip Customizado (opcional) */}
                      <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                        {tooltipText}
                      </span>
                    </div>
                    {/* Rótulo do Mês (fixo embaixo) */}
                    <span className="absolute -bottom-6 text-xs text-gray-400">{meses[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Transações Recentes</h2>
          <ul className="space-y-3">
            {transacoesRecentes.length > 0 ? (
              transacoesRecentes.map((t) => (
                <li key={t.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm border-b border-gray-700 pb-2 last:border-b-0">
                  <div className="flex-1 truncate pr-2">
                    <span className="block">{t.descricao || 'Transação'}</span>
                    {/* Renderiza a data se for válida */}
                    {t.data && t.data.toDate && <span className="text-xs text-gray-400 block sm:inline">{t.data.toDate().toLocaleDateString('pt-BR')}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className={`font-medium ${t.tipo === 'Receita' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatarMoeda(t.valor)}
                    </span>
                    <button onClick={() => handleEditClick(t)} className="text-blue-400 hover:text-blue-300 transition p-1" title="Editar" aria-label={`Editar ${t.descricao || 'transação'}`}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(t.id)} className="text-red-400 hover:text-red-300 transition p-1" title="Deletar" aria-label={`Deletar ${t.descricao || 'transação'}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-400">Nenhuma transação recente encontrada.</li>
            )}
          </ul>
        </div>
      </div>

      {/*Adicionar Transação */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveTransaction}
        />
      )}

      {/*Editar Transação */}
      {showEditModal && transactionToEdit && (
        <EditTransactionModal
          onClose={() => {
            setShowEditModal(false);
            setTransactionToEdit(null);
          }}
          transactionToEdit={transactionToEdit}
        // REMOVIDA A PROP onUpdate, pois o modal usa o hook useFinancas.
        />
      )}
    </div>
  );
}