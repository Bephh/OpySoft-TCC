import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from 'lucide-react';
import Painel from "../pages/Painel";
import Inventario from "../pages/Inventario";
import Pedidos from "../pages/Pedidos";
import Planos from "../pages/Planos";
import Montador from "../pages/Montador";
import Financas from "../pages/Financas";

export default function DashBoard() {
  const [activeTab, setActiveTab] = useState("Painel");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="md:hidden mb-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md bg-[#071028] text-white">
            <Menu size={20} />
          </button>
        </div>
        {activeTab === "Painel" && <Painel />}
        {activeTab === "Inventário" && <Inventario />}
        {activeTab === "Pedidos" && <Pedidos />}
        {activeTab === "Planos" && <Planos />}
        {activeTab === "Montador de PC" && <Montador />}
        {activeTab === "Finanças" && <Financas />}
      </main>
    </div>
  );
}

