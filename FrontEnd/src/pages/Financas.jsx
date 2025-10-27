import React from "react";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

export default function Financas() {
  return (
    <div className="p-6 bg-[#0f172a] text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão Financeira</h1>
          <p className="text-gray-400">
            Acompanhe receitas, despesas e lucratividade.
          </p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer">
          + Adicionar Transação
        </button>
      </div>

      {/* Cards financas*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Receita Total"
          icon={<TrendingUp className="text-green-500" />}
          value="R$0,00"
        />
        <Card
          title="Despesas Totais"
          icon={<TrendingDown className="text-red-500" />}
          value="R$0,00"
        />
        <Card
          title="Lucro Líquido"
          icon={<DollarSign className="text-green-500" />}
          value="R$0,00"
        />
      </div>

      {/* Gráficos e Transações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Tendência de Receita */}
        <div className="bg-[#0b1220] rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Tendência de Receita</h2>
          <div className="h-48 flex items-end justify-between text-gray-500">
            <span>R$100k</span>
            <div className="w-full h-40 flex items-end justify-between">
              {Array(12)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-${i % 2 === 0 ? "20" : "10"} bg-blue-500 rounded-full`}
                  ></div>
                ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
              (m) => (
                <span key={m}>{m}</span>
              )
            )}
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-[#0b1220] rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Transações Recentes</h2>
          <div className="text-gray-500">
            <div className="flex justify-between mb-2">
              <span>Descrição</span>
              <span>Valor</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nenhuma transação</span>
              <span className="text-gray-400">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Card = ({ title, icon, value }) => (
  <div className="bg-[#0b1220] p-5 rounded-xl shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm text-gray-400">{title}</h3>
      {icon}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);