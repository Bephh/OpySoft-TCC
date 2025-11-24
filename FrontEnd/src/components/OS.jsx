import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Plus, Edit, Trash2, Search, ClipboardList, Clock, CheckCircle, XCircle, AlertTriangle, Package, DollarSign, Wrench } from 'lucide-react';
import AddOSModal from '../components/AddOSModal';

// Status de Ordem de Serviço
const OS_STATUS = [
  { value: 'Recebido', label: 'Recebido', icon: Clock, color: 'bg-blue-500' },
  { value: 'Diagnóstico', label: 'Diagnóstico', icon: Search, color: 'bg-yellow-500' },
  { value: 'Aguardando Peça', label: 'Aguardando Peça', icon: Package, color: 'bg-orange-500' },
  { value: 'Em Reparação', label: 'Em Reparação', icon: Wrench, color: 'bg-indigo-500' },
  { value: 'Aguardando Cliente', label: 'Aguardando Cliente', icon: AlertTriangle, color: 'bg-red-500' },
  { value: 'Finalizado', label: 'Finalizado', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'Cancelado', label: 'Cancelado', icon: XCircle, color: 'bg-gray-500' },
];

// Helper para formatar moeda
const formatBRL = (value) => {
  const numValue = parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export default function OrdemDeServico() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, `users/${currentUser.uid}/ordens_servico`),
        orderBy('data_recebimento', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const osList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(osList);
        setLoading(false);
      }, (error) => {
        console.error("Erro ao buscar ordens de serviço:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.equipamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddOrder = async (newOrderData) => {
    try {
      const osRef = doc(collection(db, `users/${currentUser.uid}/ordens_servico`));
      await setDoc(osRef, {
        ...newOrderData,
        data_recebimento: new Date().toISOString(),
        status: 'Recebido', // Status inicial
        valor_total: parseFloat(newOrderData.valor_total) || 0,
      });
      setIsAddModalOpen(false);
      return Promise.resolve(); // Retorna uma Promise resolvida para o modal
    } catch (error) {
      console.error("Erro ao adicionar Ordem de Serviço:", error);
      alert("Falha ao adicionar OS. Verifique o console para detalhes.");
      return Promise.reject(error); // Retorna uma Promise rejeitada
    }
  };

  const handleEditOrder = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/ordens_servico`, id), updatedData);
      setIsEditModalOpen(false);
      setEditingOrder(null);
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao editar Ordem de Serviço:", error);
      alert("Falha ao editar OS. Verifique o console para detalhes.");
      return Promise.reject(error);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
      try {
        await deleteDoc(doc(db, `users/${currentUser.uid}/ordens_servico`, id));
      } catch (error) {
        console.error("Erro ao excluir Ordem de Serviço:", error);
        alert("Falha ao excluir OS. Verifique o console para detalhes.");
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/ordens_servico`, id), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Falha ao atualizar status. Verifique o console para detalhes.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Carregando Ordens de Serviço...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
        <ClipboardList className="mr-3" size={28} />
        Ordens de Serviço
      </h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por Cliente ou Equipamento..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white border-gray-600 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <select
            className="py-2 px-4 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white border-gray-600"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            {OS_STATUS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Nova OS
        </button>
      </div>

      <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">OS ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Equipamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor Estimado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Recebimento</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const statusInfo = OS_STATUS.find(s => s.value === order.status) || { label: order.status, color: 'bg-gray-400' };
                return (
                  <tr key={order.id} className="hover:bg-gray-700 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.cliente_nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.equipamento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatBRL(order.valor_total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(order.data_recebimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => { setEditingOrder(order); setIsEditModalOpen(true); }}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                      {/* Exemplo de menu de atualização de status (simplificado) */}
                      <select
                        className="ml-3 py-1 px-2 border rounded-lg text-sm bg-gray-700 text-white border-gray-600"
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        value={order.status}
                      >
                        {OS_STATUS.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-400">Nenhuma Ordem de Serviço encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar OS */}
      <AddOSModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddOrder}
      />

      {/* Modal de Edição de OS (Reutiliza o mesmo modal, passando os dados para edição) */}
      {isEditModalOpen && editingOrder && (
        <AddOSModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingOrder(null); }}
          onAdd={(updatedData) => handleEditOrder(editingOrder.id, updatedData)}
          initialData={editingOrder} // Passa os dados iniciais para o modal
        />
      )}
    </div>
  );
}
