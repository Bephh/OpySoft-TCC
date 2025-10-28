import React from "react";
import {
  Home,
  Box,
  ShoppingCart,
  Cpu,
  DollarSign,
  Layers,
  Wrench,
  LogOut, // Ícone de Logout
} from "lucide-react";
// 1. Importar o hook de autenticação
import { useAuth } from "../AuthContext";
// 2. Importar useNavigate para redirecionar após o logout
import { useNavigate } from "react-router-dom";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  // 3. Obter dados e a função de logout do contexto
  const { userData, currentUser, logout } = useAuth();

  // Dados a serem exibidos no perfil:
  // Usa o 'nome_empresa' se existir, senão usa o email do Firebase
  const profileName = userData?.nome_empresa || currentUser?.email || 'N/A';
  const profileEmail = currentUser?.email || 'N/A';
  const initialLetter = profileName ? profileName[0].toUpperCase() : 'N';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redireciona para a tela de login
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Falha ao sair. Tente novamente.");
    }
  };

  const tabs = [
    { name: "Painel", icon: <Home size={18} /> },
    { name: "Inventário", icon: <Box size={18} /> },
    { name: "Pedidos", icon: <ShoppingCart size={18} /> },
    { name: "Montador de PC", icon: <Cpu size={18} /> },
    { name: "Finanças", icon: <DollarSign size={18} /> },
    { name: "Planos", icon: <Layers size={18} /> },
  ];

  return (
    <aside className="w-64 bg-[#0b1220] flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded">
            <Wrench className="text-white w-5 h-5 cursor-pointer" />
          </div>
          <h1 className="text-xl font-bold">OpySoft</h1>
        </div>

        <nav className="px-4 space-y-2 text-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              type="button"
              onClick={() => setActiveTab(tab.name)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition cursor-pointer ${activeTab === tab.name ? "bg-[#1e293b] text-white" : "hover:bg-[#1e293b]"
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
        {/* O grupo hover permite que o ícone de logout apareça ao passar o mouse */}
        <div className="flex items-center justify-between group p-2 rounded-md hover:bg-[#1e293b] transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
              {initialLetter}
            </div>
            <div>
              <p className="font-semibold text-sm">{profileName}</p>
              <p className="text-xs text-gray-400">{profileEmail}</p>
            </div>
          </div>
          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
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