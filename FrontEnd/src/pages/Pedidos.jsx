import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import OrderModal from "../components/OrderModal";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db } from '../firebase-config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { updateEstoqueFromPedido } from '../utils/estoqueUtils';

// Função de formatação para R$ (mantida)
const formatBRL = (value) => {
  const numValue = parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export default function Pedidos() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  const tabs = ["Todos", "Pendente", "Processando", "Enviados", "Entregues", "Cancelado"];
  const orderStatuses = ["Pendente", "Processando", "Enviados", "Entregues", "Cancelado"];

  // Efeito para buscar os pedidos do Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    // Caminho CORRETO: /users/{uid}/pedidos
    const ordersCollectionRef = collection(db, 'users', currentUser.uid, 'pedidos');

    const q = query(ordersCollectionRef, orderBy('dataCriacao', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.dataCriacao?.toDate ? data.dataCriacao.toDate() : new Date(),
          total: data.total || data.suggestedPrice || 0,
          client: data.clientName || data.client || 'N/A',
          status: data.status || 'Pendente',
          components: data.components || [],
        };
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar pedidos:", error);
      setOrders([]);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Função para abrir o modal (mantida)
  const handleOpenModal = (order = null) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  };

  // Funções de CRUD (simplificadas e ajustadas)

  const handleSaveOrder = async (newOrderData) => {
    if (!currentUser?.uid) return;
    // Caminho CORRETO
    const baseCollection = collection(db, 'users', currentUser.uid, 'pedidos');

    try {
      if (newOrderData.id) {
        // Edição (OK)
        const orderRef = doc(baseCollection, newOrderData.id);

        await updateDoc(orderRef, {
          clientName: newOrderData.clientName,
          total: newOrderData.total,
          status: newOrderData.status,
          notes: newOrderData.notes,
          components: newOrderData.components,
        });
      } else {
        // Criação (CORREÇÃO: Uso de addDoc)
        await addDoc(baseCollection, {
          clientName: newOrderData.clientName,
          total: newOrderData.total,
          status: newOrderData.status,
          notes: newOrderData.notes,
          dataCriacao: serverTimestamp(),
          components: newOrderData.components,
          userId: currentUser.uid,
        });
      }
      setIsModalOpen(false);
      setOrderToEdit(null);
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      alert("Falha ao salvar o pedido. Detalhes: " + error.message);
    }
  };

  // FUNÇÃO DE DELEÇÃO
  const handleDeleteOrder = async (id) => {
    if (!currentUser?.uid) return;
    if (!window.confirm(`Tem certeza que deseja deletar o pedido ${id.substring(0, 6)}...? Isso IRÁ ESTORNAR o estoque dos itens, se ele não estiver "Entregue" ou "Cancelado".`)) {
      return;
    }

    try {
      const order = orders.find(o => o.id === id);
      if (order) {
        if (order.status !== 'Entregues' && order.status !== 'Enviados' && order.status !== 'Cancelado') {
          await updateEstoqueFromPedido(order.components, currentUser.uid, 1);
        }
      }

      // Caminho CORRETO
      const orderRef = doc(db, 'users', currentUser.uid, 'pedidos', id);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error("Erro ao deletar pedido e/ou estornar estoque:", error);
      alert("Falha ao deletar o pedido. Detalhes: " + error.message);
    }
  };

  // FUNÇÃO DE ATUALIZAÇÃO DE STATUS
  const handleUpdateStatus = async (id, newStatus) => {
    if (!currentUser?.uid) return;

    const order = orders.find(o => o.id === id);
    if (!order) return;
    const oldStatus = order.status;

    if (oldStatus === newStatus) return;

    try {
      // Caminho CORRETO
      const orderRef = doc(db, 'users', currentUser.uid, 'pedidos', id);
      await updateDoc(orderRef, { status: newStatus });

      // ... (lógica de estoque mantida)
      if (
        (newStatus === 'Entregues' || newStatus === 'Enviados') &&
        (oldStatus !== 'Entregues' && oldStatus !== 'Enviados')
      ) {
        await updateEstoqueFromPedido(order.components, currentUser.uid, -1);
      }
      else if (newStatus === 'Cancelado' && oldStatus !== 'Cancelado') {
        await updateEstoqueFromPedido(order.components, currentUser.uid, 1);
      }
    } catch (error) {
      console.error("Erro ao atualizar status e/ou estoque:", error);
      alert("Falha ao atualizar o status. Detalhes: " + error.message);
    }
  };

  // -----------------------------------------------------------------
  // CORREÇÃO CRÍTICA DO CRASH: Definir funções e filteredOrders
  // -----------------------------------------------------------------
  const getStatusStyle = (status) => {
    // Lógica de cores baseada no status
    switch (status) {
      case 'Pendente': return 'bg-yellow-800 text-yellow-200 border-yellow-700';
      case 'Processando': return 'bg-blue-800 text-blue-200 border-blue-700';
      case 'Enviados': return 'bg-purple-800 text-purple-200 border-purple-700';
      case 'Entregues': return 'bg-green-800 text-green-200 border-green-700';
      case 'Cancelado': return 'bg-red-800 text-red-200 border-red-700';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (tab === "Todos") {
      return true;
    }
    return order.status === tab;
  });
  // -----------------------------------------------------------------


  return (
    <div className="text-white p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Gestão de Pedidos</h1>
          <p className="text-gray-400">
            Processos, acompanhe e crie pedidos (incluindo os gerados no Montador).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition duration-150 shadow-lg"
        >
          <Plus size={18} />
          Novo Pedido Manual
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-700/50 overflow-x-auto whitespace-nowrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 -mb-px font-medium transition duration-150 ${tab === t
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-t-md"
              }`}
          >
            {t} ({orders.filter(o => t === 'Todos' || o.status === t).length})
          </button>
        ))}
      </div>

      {/* Tabela */}
      <section className="bg-[#1e293b] p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">{tab === "Todos" ? "Todos os Pedidos" : `Pedidos ${tab}`}</h2>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Carregando pedidos do Firestore...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-300 border-separate" style={{ borderSpacing: '0 0.5rem' }}>
              <thead className="text-gray-400">
                <tr>
                  <th className="py-3 px-4 font-normal">ID</th>
                  <th className="py-3 px-4 font-normal">Cliente</th>
                  <th className="py-3 px-4 font-normal">Data</th>
                  <th className="py-3 px-4 font-normal">Total</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="bg-[#0f172a] rounded-lg shadow-md hover:bg-[#152033] transition duration-200 cursor-pointer"
                      onClick={() => handleOpenModal(order)}
                    >
                      <td className="py-4 px-4 text-blue-400 font-mono rounded-l-lg">{order.id.substring(0, 6)}...</td>
                      <td className="py-4 px-4 font-medium">{order.client}</td>
                      <td className="py-4 px-4 text-sm">{format(order.date, 'dd/MM/yyyy', { locale: ptBR })}</td>
                      <td className="py-4 px-4 font-bold text-green-400">{formatBRL(order.total)}</td>
                      <td className="py-4 px-4">
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={`p-2 pr-8 rounded-lg text-xs font-semibold cursor-pointer border ${getStatusStyle(order.status)} 
                                                         focus:ring-blue-500 focus:border-blue-500 transition appearance-none`}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                          >
                            {orderStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 flex gap-1 rounded-r-lg" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenModal(order)}
                          className="p-2 rounded-full text-blue-400 hover:bg-blue-800/70 transition"
                          title="Visualizar/Editar Pedido Completo"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 rounded-full text-red-400 hover:bg-red-800/70 transition"
                          title="Deletar Pedido"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500 bg-[#0f172a] rounded-lg">
                      Nenhum pedido na categoria "{tab}".
                    </td>
                  </tr>
                )}
              </tbody>
              {/* ... (Tfoot opcional) */}
            </table>
          </div>
        )}
      </section>

      {/* Modal de Adicionar/Editar/Visualizar Pedido */}
      {isModalOpen && (
        <OrderModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrder}
          orderToEdit={orderToEdit}
        />
      )}
    </div>
  );
}