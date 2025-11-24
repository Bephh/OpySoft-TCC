import React, { useState } from 'react';
  import {
    Home,
    Package,
    ShoppingCart,
    Settings, // Usado para Montador de PC (Montar)
    DollarSign,
    Layers,    // Ícone de Planos
    Briefcase, // NOVO ÍCONE: Usado para PCs Montados (Inventário)
    LogOut,
    X,
    Wrench,
    User, // NOVO ÍCONE: Para Perfil
    BarChart, // NOVO ÍCONE: Para Relatórios
    ClipboardList, // NOVO ÍCONE: Para Ordem de Serviço
    Users // NOVO ÍCONE: Para Clientes
  } from 'lucide-react';
  import { useAuth } from "../AuthContext";
  import { useNavigate } from "react-router-dom";

  // Mapeamento de strings para componentes de ícone
  const IconMap = {
    Wrench,
    Home,
    Package,
    ShoppingCart,
    Settings,
    Briefcase,
    DollarSign,
    Layers,
    BarChart,
    User,
    ClipboardList,
    Users,
  };

  export default function Sidebar({ activeTab, setActiveTab, isOpen = true, onClose = () => { } }) {
    const navigate = useNavigate();
    const { userData, currentUser, logout } = useAuth();

    const profileName = userData?.nome_empresa || currentUser?.email || 'N/A';
    const profileEmail = currentUser?.email || 'N/A';
    const initialLetter = profileName ? profileName[0].toUpperCase() : 'N';
    
    // Obter o ícone da aplicação do userData, com fallback para 'Wrench'
    const AppIconComponent = IconMap[userData?.app_icon] || Wrench;

    const handleLogout = async () => {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Falha ao sair. Tente novamente.");
      }
    };

    // Definição dos itens de navegação (AGORA COM AS DUAS ABAS)
    const tabs = [
      { name: "Painel", icon: <Home size={18} /> },
      { name: "Inventário", icon: <Package size={18} /> },
      { name: "Pedidos", icon: <ShoppingCart size={18} /> },
      // Aba Antiga: Mapeia para Montador.jsx (montar)
      { name: "Montador de PC", icon: <Settings size={18} /> },
      // Aba Nova: Mapeia para Montados.jsx (inventário)
      { name: "PCs Montados", icon: <Briefcase size={18} /> },
      { name: "Finanças", icon: <DollarSign size={18} /> },
      { name: "Planos", icon: <Layers size={18} /> },
      { name: "Relatórios", icon: <BarChart size={18} /> },
      { name: "Ordem de Serviço", icon: <ClipboardList size={18} /> },
      { name: "Clientes", icon: <Users size={18} /> },
    ];

    return (
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-screen transform transition-transform 
                         bg-gray-900 
                         flex flex-col justify-between 
                         ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                         md:relative md:translate-x-0 md:h-full md:inset-auto`}>
        <div>
          <div className="p-6 flex items-center gap-2 relative">
            {/* Ícone da Aplicação Dinâmico */}
            <div className="bg-blue-600 p-2 rounded">
              <AppIconComponent className="text-white w-5 h-5 cursor-pointer" />
            </div>
            <h1 className="text-xl font-bold text-white">{userData?.nome_empresa || 'OpySoft'}</h1>
            <button
              onClick={onClose}
              className="md:hidden absolute right-3 top-3 text-gray-300 p-1"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="px-4 space-y-2 text-gray-300">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition cursor-pointer 
                           ${activeTab === tab.name 
                             ? "bg-slate-700 text-white" 
                             : "hover:bg-slate-700"
                           }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Área de Perfil e Logout */}
        <div className="p-4 border-t border-gray-700">
          {/* REMOVIDO: Botão de alternância de tema */}
          
          {/* Torna a área de perfil clicável para ir para a aba 'Perfil' */}
          <div
            className="flex items-center justify-between group p-2 rounded-md 
                       hover:bg-slate-700 
                       transition cursor-pointer"
            onClick={() => setActiveTab('Perfil')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                {initialLetter}
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{profileName}</p>
                <p className="text-xs text-gray-400">{profileEmail}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleLogout(); }} // Adiciona e.stopPropagation() para evitar que o clique no botão de logout ative o clique do perfil
              title="Sair da conta"
              className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    );
  }