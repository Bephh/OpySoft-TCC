import React from 'react';
import { DollarSign, ShoppingCart, Archive, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardData } from "../hooks/useDashboardData";
import { useRelatorios } from "../hooks/useRelatorios"; // Hook do painel
import { formatarMoeda } from '../utils/format';

// Componente Card para os resumos
const DashboardCard = ({ title, value, icon, className = "", children }) => (
  
  <div className={`bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-lg flex flex-col justify-between ${className}`}>
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
    </div>
    {children}
  </div>
);


const BarChart = ({ data, labels, title, colorClass, isCurrency = false }) => {
  const maxVal = Math.max(...data, 1);
  const formatValue = isCurrency ? (val) => formatarMoeda(val) : (val) => val;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="flex-1 flex items-end justify-between h-48">
        {data.map((val, index) => {
          const heightPercent = (val / maxVal) * 100;
          return (
            <div key={labels[index]} className="flex flex-col items-center h-full justify-end w-1/12 relative group">
              <div
                className={`w-4 rounded-t-md transition-all duration-500 ${colorClass}`}
                style={{ height: `${heightPercent}%` }}
              ></div>
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                {formatValue(val)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{labels[index]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function Painel() {
	  const {
		    variacaoReceita,
			    receitaPorMes,
			    volumePedidosPorMes,
			    novosPedidos,
			    osEmAberto,
			    osTotal,
			    totalClientes,
			    clientesRecorrentes,
			    loading: loadingDashboard,
			    erro: erroDashboard,
			  } = useDashboardData();

			  const { totalRevenue, totalCost, totalProfit, loading: loadingRelatorios, erro: erroRelatorios } = useRelatorios();

			  const loading = loadingDashboard || loadingRelatorios;
			  const erro = erroDashboard || erroRelatorios;

  if (loading) {
 
    return <div className="p-6 text-gray-900 dark:text-white text-center">Carregando dados do Painel...</div>;
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const isPositive = parseFloat(variacaoReceita) >= 0;
  const arrowIcon = isPositive ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-red-500" />;

  return (

    <div className="p-6 bg-transparent text-gray-900 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Painel</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Bem-vindo de volta, aqui está um resumo de suas operações.</p>

      {erro && (

        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-6 text-red-700 dark:text-red-300">
          ⚠️ **ERRO:** {erro}. Verifique os logs do console.
        </div>
      )}

	      {/* Cards de Resumo */}
	      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
	
		        {/* 1. Lucro Total */}
		        <DashboardCard
		          title="Lucro Total"
		          value={formatarMoeda(totalProfit)}
		          icon={<DollarSign className="text-green-500" />}
		          className="aspect-square"
		        >
		          <div className={`text-sm flex items-center mt-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
		            {arrowIcon}
		            <span className="ml-1">{variacaoReceita}% do último mês</span>
		          </div>
		        </DashboardCard>
		
		        {/* 2. Receita Total */}
		        <DashboardCard
		          title="Receita Total"
		          value={formatarMoeda(totalRevenue)}
		          icon={<TrendingUp className="text-blue-500" />}
		          className="aspect-square"
		        >
		          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Faturamento Bruto</span>
		        </DashboardCard>
		
		        {/* 3. Custo Total */}
		        <DashboardCard
		          title="Custo Total"
		          value={formatarMoeda(totalCost)}
		          icon={<TrendingDown className="text-red-500" />}
		          className="aspect-square"
		        >
		          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Custos de Produção e Despesas</span>
		        </DashboardCard>
		
		        {/* 4. OS em Aberto */}
		        <DashboardCard
		          title="OS em Aberto"
		          value={osEmAberto}
		          icon={<Archive className="text-orange-500" />}
		          className="aspect-square"
		        >
		          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">{osTotal} OSs totais registradas</span>
		        </DashboardCard>
	      </div>

	      {/* Gráficos e Listas */}
	      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
	
	        {/* Visão Geral da Receita */}
	        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-lg h-96 lg:col-span-1">
          <BarChart
            title="Visão Geral da Receita"
            data={receitaPorMes}
            labels={meses}
            colorClass="bg-green-500"
            isCurrency={true}
          />
        </div>

	        {/* Volume de Pedidos */}
	        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-lg h-96 lg:col-span-1">
          <BarChart
            title="Volume de Pedidos"
            data={volumePedidosPorMes}
            labels={meses}
            colorClass="bg-blue-500"
            isCurrency={false}
          />
        </div>

	        {/* Total de Clientes */}
	        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-lg h-96 lg:col-span-1 flex flex-col justify-center items-center">
	          <div className="text-center">
	            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total de Clientes</p>
	            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{totalClientes}</p>
	            <p className="text-sm text-green-500">Clientes Recorrentes: {clientesRecorrentes}</p>
	          </div>
	        </div>
	      </div>
    </div>
  );
}