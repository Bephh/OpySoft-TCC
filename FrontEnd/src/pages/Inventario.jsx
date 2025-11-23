// src/pages/Inventario.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import AddItemModal from '../components/AddItemModal';
import AdjustStockModal from '../components/AdjustStockModal';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

// Categorias de componentes para o filtro
const COMPONENT_CATEGORIES = [
  { value: '', label: 'Todos os Componentes' },
  { value: 'CPU', label: 'Processador (CPU)' },
  { value: 'Placa-Mãe', label: 'Placa-Mãe' },
  { value: 'RAM', label: 'Memória RAM' },
  { value: 'GPU', label: 'Placa de Vídeo (GPU)' },
  { value: 'Armazenamento', label: 'Armazenamento' },
  { value: 'Fonte', label: 'Fonte' },
  { value: 'Gabinete', label: 'Gabinete' },
  { value: 'Cooler', label: 'Cooler (Refrigeração)' },
  { value: 'Periférico', label: 'Periférico (Fone, Mouse, etc.)' },
  { value: 'Outros', label: 'Outros' },
];

// Helper para definir a cor do status
const getStatusClasses = (quantity, minStock, criticalStock) => {
  const q = parseFloat(quantity) || 0;
  const min = parseFloat(minStock) || 0;
  const crit = parseFloat(criticalStock) || 0;

  if (q <= crit) {
    return { label: 'Crítico', className: 'bg-red-600 text-white' };
  } else if (q <= min) {
    return { label: 'Baixo', className: 'bg-yellow-500 text-gray-900' };
  } else {
    return { label: 'Em Estoque', className: 'bg-green-600 text-white' };
  }
};

// Helper para formatar moeda
const formatBRL = (value) => {
  const numValue = parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export default function Inventario() {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Carregamento dos dados do inventário
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const inventoryCollectionRef = collection(db, 'empresas', currentUser.uid, 'inventario');
    const q = query(inventoryCollectionRef, orderBy('category', 'asc'), orderBy('component', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        price: parseFloat(doc.data().price) || 0,
        quantity: parseFloat(doc.data().quantity) || 0,
        sku: doc.data().sku || 'N/A',
        categoryKey: doc.data().category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') || 'outros',
      }));
      setInventory(items);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar inventário:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Função para salvar um NOVO item
  const onSaveItem = async (newItem) => {
    if (!currentUser?.uid) return;

    try {
      const docRef = doc(collection(db, 'empresas', currentUser.uid, 'inventario'));
      await setDoc(docRef, {
        ...newItem,
        id: docRef.id,
        quantity: String(parseFloat(newItem.quantity) || 0),
        minStock: String(parseFloat(newItem.minStock) || 0),
        criticalStock: String(parseFloat(newItem.criticalStock) || 0),
        estimatedPower: parseFloat(newItem.estimatedPower) || 0,
        price: String(parseFloat(newItem.price) || 0),
      });
      setShowAddModal(false);
      alert("Item adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      alert("Falha ao adicionar item.");
    }
  };

  // ✅ FUNÇÃO CORRIGIDA: Salva um item EXISTENTE
  const onUpdateItem = async (updatedItemData) => {
    if (!currentUser?.uid || !updatedItemData?.id) {
      alert("Erro: ID do item ou usuário ausente.");
      return;
    }

    try {
      const itemRef = doc(db, 'empresas', currentUser.uid, 'inventario', updatedItemData.id);

      const dataToUpdate = {
        ...updatedItemData,
        quantity: String(parseFloat(updatedItemData.quantity) || 0),
        price: String(parseFloat(updatedItemData.price) || 0),
        minStock: String(parseInt(updatedItemData.minStock, 10) || 0),
        criticalStock: String(parseInt(updatedItemData.criticalStock, 10) || 0),
        estimatedPower: parseInt(updatedItemData.estimatedPower, 10) || 0,
        watt: parseInt(updatedItemData.watt, 10) || 0,
      };
      delete dataToUpdate.id;

      await updateDoc(itemRef, dataToUpdate);

      alert("Item atualizado com sucesso!");
      setItemToEdit(null); // Fecha o modal

    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      alert("Falha ao atualizar o item. Verifique o console para mais detalhes.");
    }
  };

  // Função para deletar um item
  const onDeleteItem = async (itemId) => {
    if (!currentUser?.uid || !window.confirm("Tem certeza que deseja DELETAR este item? A ação é irreversível.")) return;

    try {
      const itemRef = doc(db, 'empresas', currentUser.uid, 'inventario', itemId);
      await deleteDoc(itemRef);
      alert("Item deletado com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      alert("Falha ao deletar item.");
    }
  };

  const handleEditClick = (item) => {
    setItemToEdit(item);
  };

  const filteredInventory = inventory.filter(item => {
    const searchMatch = item.component?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === '' || item.category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  if (loading) {
    return <div className="text-white p-8">Carregando inventário...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Inventário de Componentes</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          <Plus size={18} /> Novo Item
        </button>
      </div>

      <div className="bg-[#1e293b] p-4 rounded-xl shadow-lg mb-6 flex flex-wrap gap-4">
        <div className="flex items-center bg-[#0f172a] rounded-lg p-2 flex-grow min-w-[250px]">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white w-full focus:outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#0f172a] text-white p-2 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
        >
          {COMPONENT_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#1e293b] p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Itens em Estoque ({filteredInventory.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-10">Nenhum componente encontrado com os filtros aplicados.</p>
          ) : (
            filteredInventory.map(item => {
              const { label, className } = getStatusClasses(item.quantity, item.minStock, item.criticalStock);
              return (
                <div key={item.id} className="bg-[#0f172a] p-4 rounded-lg shadow-md border border-gray-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 truncate" title={item.component}>{item.component}</h3>
                    <p className="text-sm text-gray-400">Categoria: {item.category}</p>
                    <p className="text-sm text-gray-400">SKU: <span className="font-medium text-gray-300">{item.sku || 'N/A'}</span></p>
                    <p className="text-sm text-yellow-400 mt-2">Custo Unitário: {formatBRL(item.price)}</p>
                    <p className="text-sm text-gray-400">Consumo Estimado: {item.estimatedPower}W</p>
                  </div>
                  <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-700">
                    <div>
                      <p className="text-sm text-gray-400">Qtde: <span className="font-medium text-gray-100">{item.quantity}</span></p>
                      {item.supplier && <p className="text-xs text-gray-400 mt-1">Fornecedor: {item.supplier}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{label}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditClick(item)} className="text-blue-400 hover:text-blue-300 p-2 rounded-md bg-gray-800/30" aria-label={`Editar ${item.component}`}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => onDeleteItem(item.id)} className="text-red-400 hover:text-red-300 p-2 rounded-md bg-gray-800/30" aria-label={`Deletar ${item.component}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} onSave={onSaveItem} />}

      {/* ✅ MODAL CORRIGIDO: Agora recebe a prop 'onUpdate' */}
      {itemToEdit && (
        <AdjustStockModal
          onClose={() => setItemToEdit(null)}
          itemToEdit={itemToEdit}
          onUpdate={onUpdateItem}
        />
      )}
    </div>
  );
}
