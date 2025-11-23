import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { BarChart, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registra os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatBRL = (value) => {
  const numValue = parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export default function Relatorios() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    bestSellingItems: [],
  });

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    fetchReportData();
  }, [currentUser]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const ordersCollectionRef = collection(db, 'empresas', currentUser.uid, 'pedidos');
      const q = query(ordersCollectionRef);
      const snapshot = await getDocs(q);

      let totalOrders = 0;
      let totalRevenue = 0;
      let totalCost = 0;
      const itemSales = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Apenas considera pedidos que foram concluídos (Entregues ou Enviados) para relatórios financeiros
        if (['Entregues', 'Enviados'].includes(data.status)) {
          totalOrders++;
          const total = parseFloat(data.total || 0);
          const costPrice = parseFloat(data.costPrice || 0);

          totalRevenue += total;
          totalCost += costPrice;

          // Agrega vendas por item
          (data.components || []).forEach(item => {
            const itemId = item.id;
            const itemName = item.name || item.component;
            const itemQty = parseFloat(item.qty || item.quantity || 0);

            if (itemId && itemQty > 0) {
              if (!itemSales[itemId]) {
                itemSales[itemId] = { name: itemName, totalSold: 0 };
              }
              itemSales[itemId].totalSold += itemQty;
            }
          });
        }
      });

      const totalProfit = totalRevenue - totalCost;
      const bestSellingItems = Object.values(itemSales)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5); // Top 5

      setReportData({
        totalOrders,
        totalRevenue,
        totalCost,
        totalProfit,
        bestSellingItems,
      });

    } catch (error) {
      console.error("Erro ao buscar dados de relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: reportData.bestSellingItems.map(item => item.name),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: reportData.bestSellingItems.map(item => item.totalSold),
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0', // gray-200
        }
      },
      title: {
        display: true,
        text: 'Top 5 Itens Mais Vendidos',
        color: '#94a3b8', // gray-400
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155', // slate-700
        }
      },
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        }
      }
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-[#0f172a] p-6 rounded-xl shadow-lg flex flex-col justify-between border border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white mt-4">{value}</p>
    </div>
  );

  if (loading) {
    return <div className="text-white p-8">Carregando Relatórios...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">Relatórios de Vendas e Estoque</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Pedidos Concluídos"
          value={reportData.totalOrders}
          icon={<Package size={20} className="text-blue-400" />}
          color="bg-blue-500/20"
        />
        <StatCard
          title="Receita Total"
          value={formatBRL(reportData.totalRevenue)}
          icon={<DollarSign size={20} className="text-green-400" />}
          color="bg-green-500/20"
        />
        <StatCard
          title="Custo Total"
          value={formatBRL(reportData.totalCost)}
          icon={<DollarSign size={20} className="text-yellow-400" />}
          color="bg-yellow-500/20"
        />
        <StatCard
          title="Lucro Total"
          value={formatBRL(reportData.totalProfit)}
          icon={<TrendingUp size={20} className="text-purple-400" />}
          color="bg-purple-500/20"
        />
      </div>

      <div className="bg-[#1e293b] p-6 rounded-xl shadow-xl border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart size={20} /> Desempenho de Vendas
        </h2>
        {reportData.bestSellingItems.length > 0 ? (
          <div className="h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-400 text-center py-10">Nenhum dado de venda concluída para gerar o gráfico.</p>
        )}
      </div>
    </div>
  );
}