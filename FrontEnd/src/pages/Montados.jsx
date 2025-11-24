import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; 
import { useAuth } from '../AuthContext';
import AddOrderModal from "../components/AddOrderModal";
import EditPCModal from '../components/EditPCModal';
import { Edit, Trash2, ShoppingCart, Search } from 'lucide-react';

const formatBRL = (value) => {
  const numValue = parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export default function Montados() {
  const { currentUser } = useAuth();
  const [pcsMontados, setPcsMontados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pcToEdit, setPcToEdit] = useState(null);
  const [pcToOrder, setPcToOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    const pcsCollectionRef = collection(db, 'empresas', currentUser.uid, 'pcs_montados');
    const q = query(pcsCollectionRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pcs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPcsMontados(pcs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar PCs Montados:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  const onDeletePC = async (pc) => {
    if (!currentUser?.uid || !window.confirm(`Tem certeza que deseja DELETAR o PC montado: ${pc.name}?`)) return;
    try {
      const pcRef = doc(db, 'empresas', currentUser.uid, 'pcs_montados', pc.id);
      await deleteDoc(pcRef);
      alert("PC Montado deletado com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar PC Montado:", error);
      alert("Falha ao deletar PC Montado.");
    }
  };

  const filteredPcs = pcsMontados.filter(pc => {
    const nameMatch = pc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const profitMarginPercentage = Number(pc.profitMargin) / 100;
    const suggestedPrice = pc.costPrice / (1 - profitMarginPercentage);
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    const priceMatch = suggestedPrice >= min && suggestedPrice <= max;
    return nameMatch && priceMatch;
  });

  const handleEditClick = (pc) => {
    setPcToEdit(pc);
  };

  const handleSendToOrder = (pc) => {
    const dataForModal = {
      pcId: pc.id, pcName: pc.name, components: pc.components,
      costPrice: pc.costPrice, profitMargin: pc.profitMargin,
      suggestedPrice: pc.suggestedPrice, estimatedPower: pc.estimatedPower,
      pcQuantity: pc.quantity,
      status: "Pendente",
    };
    setPcToOrder(dataForModal);
  };

  // ✅ CORREÇÃO: Esta função agora APENAS cria o pedido. A lógica de estoque foi movida para Pedidos.jsx.
  const handleFinalizePCMontadoTransaction = async (finalOrderData) => {
    if (!currentUser?.uid) {
      alert("Erro de autenticação.");
      return;
    }
    setLoading(true);
    setPcToOrder(null);

    const newOrderRef = doc(collection(db, 'empresas', currentUser.uid, 'pedidos'));
    const orderDocData = {
      clientName: finalOrderData.clientName || 'Cliente Padrão',
      total: String(finalOrderData.suggestedPrice || 0),
      costPrice: String(finalOrderData.costPrice || 0),
      profitMargin: Number(finalOrderData.profitMargin || 0),
      status: finalOrderData.status || "Pendente",
      notes: finalOrderData.notes || '',
      dataCriacao: serverTimestamp(),
      orderId: newOrderRef.id,
      components: finalOrderData.components,
      // Flags essenciais para a lógica de estoque em Pedidos.jsx
      // Adiciona a quantidade atual do PC Montado para a lógica de zeramento
      pcQuantity: finalOrderData.pcQuantity,
      origin: 'PC_MONTADO',
      originId: finalOrderData.pcId,
    };

    try {
      // Apenas cria o documento do pedido. Nenhuma transação de estoque aqui.
      await setDoc(newOrderRef, orderDocData);

      // ✅ CORREÇÃO 1: Zera a quantidade do PC Montado se for 1
      const pcRef = doc(db, 'empresas', currentUser.uid, 'pcs_montados', finalOrderData.pcId);
      const currentQty = parseFloat(finalOrderData.pcQuantity) || 0;
      if (currentQty === 1) {
        await updateDoc(pcRef, { quantity: "0" });
      } else if (currentQty > 1) {
        // Se a quantidade for maior que 1, apenas decrementa em 1
        await updateDoc(pcRef, { quantity: String(currentQty - 1) });
      }
      alert(`✅ Pedido para "${finalOrderData.pcName}" criado com sucesso! O estoque será deduzido quando o status for alterado para 'Entregue' ou 'Enviado'.`);
    } catch (error) {
      console.error("Erro ao criar o pedido a partir do PC Montado:", error);
      alert(`❌ Falha ao criar o pedido. Detalhes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePC = async (pcId, updatedData) => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const pcRef = doc(db, 'empresas', currentUser.uid, 'pcs_montados', pcId);
      await updateDoc(pcRef, updatedData);
      alert("PC Montado atualizado com sucesso.");
      setPcToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar PC Montado:", error);
      alert("Falha ao atualizar PC Montado.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white p-8">Carregando PCs montados...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Inventário de PCs Montados</h1>
      </div>
      <div className="bg-[#1e293b] p-4 rounded-xl shadow-lg mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center bg-[#0f172a] rounded-lg p-2 flex-grow min-w-[200px]">
          <Search size={20} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Buscar por nome do PC..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent text-white w-full focus:outline-none" />
        </div>
        <div className="flex items-center bg-[#0f172a] rounded-lg p-2 min-w-[150px]">
          <span className="text-gray-400 mr-2 text-sm">Min R$:</span>
          <input type="number" placeholder="Preço Mínimo" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="bg-transparent text-white w-full focus:outline-none" />
        </div>
        <div className="flex items-center bg-[#0f172a] rounded-lg p-2 min-w-[150px]">
          <span className="text-gray-400 mr-2 text-sm">Max R$:</span>
          <input type="number" placeholder="Preço Máximo" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="bg-transparent text-white w-full focus:outline-none" />
        </div>
      </div>
      <div className="bg-[#1e293b] p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">PCs Prontos para Venda ({filteredPcs.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPcs.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-10">Nenhum PC montado encontrado.</p>
          ) : (
            filteredPcs.map(pc => {
              const hasStock = (parseFloat(pc.quantity) || 0) > 0;
              return (
                <div key={pc.id} className={`bg-[#0f172a] p-4 rounded-lg shadow-md border border-gray-800 flex flex-col justify-between ${!hasStock ? 'opacity-50' : ''}`}>
                  <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-100 truncate" title={pc.name}>{pc.name}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${hasStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            Qtd: {parseFloat(pc.quantity) || 0}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Custo: <span className="text-yellow-400 font-medium">{formatBRL(pc.costPrice)}</span></p>
                    <p className="text-sm text-gray-400">Margem: <span className="font-medium text-purple-400">{pc.profitMargin}%</span></p>
                    <p className="text-lg text-gray-100 mt-2">Venda: <span className="text-green-400 font-bold">{formatBRL(pc.suggestedPrice)}</span></p>
                  </div>
                  <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-700">
                    <button onClick={() => handleSendToOrder(pc)} className="text-teal-400 p-2 bg-gray-800/30 rounded-md hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Criar Pedido" disabled={!hasStock}>
                      <ShoppingCart size={16} />
                    </button>
                    <button onClick={() => handleEditClick(pc)} className="text-blue-400 p-2 bg-gray-800/30 rounded-md hover:bg-gray-700 transition" title="Editar PC"><Edit size={16} /></button>
                    <button onClick={() => onDeletePC(pc)} className="text-red-400 p-2 bg-gray-800/30 rounded-md hover:bg-gray-700 transition" title="Deletar PC"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {pcToOrder && <AddOrderModal initialData={pcToOrder} onClose={() => setPcToOrder(null)} onFinalize={handleFinalizePCMontadoTransaction} isFromMontados={true} />}
      {pcToEdit && <EditPCModal pc={pcToEdit} onClose={() => setPcToEdit(null)} onSave={handleUpdatePC} />}
    </div>
  );
}