import React, { useState } from 'react';
import Sidebar from './Sidebar';

// Importe todos os seus componentes de página de src/pages/
// Estes nomes DEVEM CORRESPONDER aos nomes dos arquivos e aos exports default.
import Painel from '../pages/Painel';
import Inventario from '../pages/Inventario';
import Pedidos from '../pages/Pedidos';
import Financas from '../pages/Financas';
import Planos from '../pages/Planos';
import Perfil from '../pages/Perfil'; // Importa o novo componente Perfil
import Relatorios from '../pages/Relatorios'; // Importa o novo componente Relatorios

// Importando os dois componentes relacionados a PC
import Montador from '../pages/Montador'; // Para a aba 'Montador de PC' (funcionalidade antiga)
import Montados from '../pages/Montados'; // Usando Montados.jsx

// --- Função de Fallback (Ajuda a debugar problemas de importação/exportação) ---
const SafeImport = (Component, name) => {
  // Verifica se o componente foi importado corretamente
  if (typeof Component === 'function' || (Component && typeof Component === 'object' && '$$typeof' in Component)) {
    return Component;
  }
  // Retorna um componente de erro com a mensagem de ajuda
  return () => (
    <div className="p-8 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-red-400 mb-4">Erro Crítico: Falha ao Carregar Componente</h2>
      <p className="text-gray-300">
        A aba <strong>"{name}"</strong> não conseguiu carregar o componente.
        <br /><br />
        <strong>Verifique o arquivo:</strong> <code>src/pages/{name}.jsx</code>
        <br />
        {/* LINHA CORRIGIDA: Usa uma string literal entre aspas dentro da tag <code> */}
        <strong>A exportação deve ser:</strong> <code>export default function {name}() {{/*...*/ }}</code>
        <br /><br />
        Também, verifique o console para erros de permissão do Firestore, que podem impedir a renderização.
      </p>
    </div>
  );
};
// --- Fim do Fallback ---


export default function DashBoard() {
  const [activeTab, setActiveTab] = useState('Painel');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mapeamento dos componentes usando o SafeImport
  const PainelComponent = SafeImport(Painel, 'Painel');
  const InventarioComponent = SafeImport(Inventario, 'Inventario');
  const PedidosComponent = SafeImport(Pedidos, 'Pedidos');
  const MontadorComponent = SafeImport(Montador, 'Montador');
  const MontadosComponent = SafeImport(Montados, 'Montados');
  const FinancasComponent = SafeImport(Financas, 'Financas');
  const PlanosComponent = SafeImport(Planos, 'Planos');
  const PerfilComponent = SafeImport(Perfil, 'Perfil'); // Mapeia o componente Perfil
  const RelatoriosComponent = SafeImport(Relatorios, 'Relatórios'); // Mapeia o componente Relatorios


  // Função para renderizar o componente baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'Painel':
        return <PainelComponent />;
      case 'Inventário':
        return <InventarioComponent />;
      case 'Pedidos':
        return <PedidosComponent />;
      // Mapeamento Corrigido 1: Para a função de Montar o PC
      case 'Montador de PC':
        return <MontadorComponent />;
      // Mapeamento Corrigido 2: Para o Inventário de PCs Prontos
      case 'PCs Montados':
        return <MontadosComponent />;
      case 'Finanças':
        return <FinancasComponent />;
      case 'Planos':
        return <PlanosComponent />;
      case 'Perfil': // Nova aba de Perfil
        return <PerfilComponent />;
      case 'Relatórios': // Nova aba de Relatórios
        return <RelatoriosComponent />;
      default:
        return <PainelComponent />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* 1. Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto bg-gray-900 text-white">
        {/* Botão de menu para telas mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-3 bg-blue-600 rounded-lg m-4 fixed top-0 left-0 z-40"
        >
          Menu
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}