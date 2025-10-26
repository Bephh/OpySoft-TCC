import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { db } from '../firebase-config';
import { collection, query, onSnapshot } from 'firebase/firestore'; 
import { useAuth } from '../AuthContext'; 

const formatBRL = (value) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export default function OrderModal({ onClose, onSave, orderToEdit }) {
    const { currentUser } = useAuth();
    const isEditing = !!orderToEdit;
    
    // Salva o status inicial para comparação na submissão
    const initialStatus = orderToEdit?.status || "Pendente"; 

    // Estados do Pedido
    const [client, setClient] = useState(orderToEdit?.clientName || orderToEdit?.client || "");
    const [status, setStatus] = useState(orderToEdit?.status || "Pendente");
    const [notes, setNotes] = useState(orderToEdit?.notes || "");
    const [components, setComponents] = useState(orderToEdit?.components || []);
    
    // Estado para a Margem de Lucro
    const [profitMargin, setProfitMargin] = useState(orderToEdit?.profitMargin || 20); 

    // Estado para o Inventário
    const [inventory, setInventory] = useState([]);
    const [selectedItemSku, setSelectedItemSku] = useState("");
    const [loadingInventory, setLoadingInventory] = useState(true);

    const orderStatuses = ["Pendente", "Processando", "Enviados", "Entregues", "Cancelado"];

    // Cálculo do Custo e Total
    const costPrice = components.reduce((sum, item) => 
        sum + ((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)), 0);
        
    const suggestedPrice = costPrice * (1 + (Number(profitMargin) / 100));

    // Efeito para buscar o Inventário
    useEffect(() => {
        if (!currentUser?.uid) {
            setLoadingInventory(false);
            return;
        }

        const q = query(collection(db, 'users', currentUser.uid, 'inventario'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(item => (item.quantity > 0)); 

            setInventory(items);
            setLoadingInventory(false);
        }, (error) => {
            console.error("Erro ao carregar inventário no modal:", error);
            setLoadingInventory(false);
        });

        return unsubscribe;
    }, [currentUser]);

    // Lógica de Itens
    const handleAddComponent = () => {
        if (!selectedItemSku) {
            alert("Selecione um item do inventário para adicionar.");
            return;
        }

        const selectedItem = inventory.find(item => item.sku === selectedItemSku);
        if (!selectedItem) return;

        const existingIndex = components.findIndex(item => item.sku === selectedItemSku);

        if (existingIndex !== -1) {
            const newComponents = [...components];
            const currentQty = newComponents[existingIndex].qty;
            const maxQty = selectedItem.quantity;
            
            if (currentQty < maxQty) {
                 newComponents[existingIndex].qty = currentQty + 1;
                 setComponents(newComponents);
            } else {
                 alert(`Estoque máximo para ${selectedItem.component} atingido (${maxQty}).`);
            }
        } else {
            setComponents([...components, { 
                sku: selectedItem.sku, 
                name: selectedItem.component, 
                price: parseFloat(selectedItem.price) || 0, 
                qty: 1, 
                id: selectedItem.id,
                tempId: Date.now() 
            }]);
        }
        setSelectedItemSku(""); 
    };

    const handleUpdateComponent = (index, field, value) => {
        const newComponents = [...components];
        let val = value;
        const itemToUpdate = newComponents[index];
        const stockItem = inventory.find(item => item.sku === itemToUpdate.sku);
        const maxQty = stockItem ? stockItem.quantity : 999; 

        if (field === 'qty') {
            val = parseInt(value) || 0;
            if (val > maxQty) {
                alert(`A quantidade máxima permitida é ${maxQty} (estoque).`);
                val = maxQty;
            } else if (val < 1) {
                val = 1;
            }
        } else if (field === 'price') {
             val = parseFloat(value) || 0;
        }

        newComponents[index][field] = val;
        setComponents(newComponents);
    };

    const handleRemoveComponent = (index) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    // Submissão do Formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!client.trim()) {
            alert("O nome do cliente é obrigatório.");
            return;
        }
        if (components.length === 0) {
            alert("Adicione pelo menos um item ao pedido.");
            return;
        }
        if (Number(profitMargin) < 0) {
            alert("A margem de lucro não pode ser negativa.");
            return;
        }

        const orderData = {
            id: orderToEdit?.id, 
            clientName: client.trim(),
            // Passa o status inicial para o componente pai para checagem de estoque
            initialStatus: isEditing ? initialStatus : null,
            total: suggestedPrice, 
            costPrice: costPrice, 
            profitMargin: Number(profitMargin), 
            status: status,
            notes: notes.trim(),
            components: components.map(({ tempId, ...rest }) => rest),
        };

        onSave(orderData); 
    };

    if (loadingInventory) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#1e293b] text-white p-10 rounded-xl">Carregando inventário...</div>
            </div>
        );
    }

    return (
        // Container principal do Modal
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            
            <div className="bg-[#1e293b] text-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                
                {/* Cabeçalho (sticky top-0 para fixar durante a rolagem) */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-[#1e293b] z-10">
                    <h2 className="text-2xl font-bold text-blue-400">
                        {isEditing ? `Detalhes/Editar Pedido ${orderToEdit.id}` : "Novo Pedido Manual"}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {/* Conteúdo do Formulário */}
                    <div className="p-6 space-y-6">
                        
                        {/* Seção de Informações Básicas e Preços */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0f172a] p-4 rounded-lg border border-gray-700">
                            <div>
                                <label htmlFor="client" className="block text-sm font-medium mb-1 text-gray-400">Cliente</label>
                                <input
                                    id="client"
                                    type="text"
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    required
                                    className="w-full p-2 rounded bg-[#1e293b] border border-gray-600"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-400">Status</label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full p-2 rounded bg-[#1e293b] border border-gray-600"
                                >
                                    {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="profitMargin" className="block text-sm font-medium mb-1 text-gray-400">Margem Lucro (%)</label>
                                <input
                                    id="profitMargin"
                                    type="number"
                                    min="0"
                                    value={profitMargin}
                                    onChange={(e) => setProfitMargin(e.target.value)}
                                    className="w-full p-2 rounded bg-[#1e293b] border border-gray-600"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Custo Total (Cálculo)</label>
                                <div className="w-full p-2 rounded bg-red-900/40 text-red-300 font-bold text-lg">
                                    {formatBRL(costPrice)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-700">
                            <label className="block text-sm font-medium mb-1 text-gray-400">Preço Sugerido (Custo + Margem)</label>
                            <div className="w-full p-2 rounded bg-green-900/40 text-green-300 font-bold text-xl text-center">
                                {formatBRL(suggestedPrice)}
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium mb-1 text-gray-400">Notas</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="2"
                                className="w-full p-2 rounded bg-[#0f172a] border border-gray-700"
                            />
                        </div>


                        {/* Seção de Adição de Itens */}
                        <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 text-blue-300">Itens ({components.length})</h3>
                        
                        <div className="flex gap-3 items-center p-3 bg-[#0f172a] rounded-lg border border-gray-800">
                            <select
                                value={selectedItemSku}
                                onChange={(e) => setSelectedItemSku(e.target.value)}
                                className="flex-grow p-2 rounded bg-[#1e293b] border border-gray-600"
                            >
                                <option value="">Selecione um item do Inventário...</option>
                                {inventory.map(item => (
                                    <option 
                                        key={item.sku} 
                                        value={item.sku}
                                        disabled={item.quantity <= 0}
                                    >
                                        {item.component} ({item.category}) - Est.: {item.quantity}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddComponent}
                                className="flex items-center gap-1 bg-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                                disabled={!selectedItemSku}
                            >
                                <Plus size={18} /> Adicionar
                            </button>
                        </div>
                        
                        {/* Tabela de Itens */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-3 text-gray-400 font-medium pb-2 border-b border-gray-700">
                                <div className="col-span-3">Nome</div>
                                <div className="col-span-2">SKU</div>
                                <div className="col-span-2 text-right">Preço Unitário</div>
                                <div className="col-span-2 text-center">Qtd</div>
                                <div className="col-span-2 text-right">Subtotal</div>
                                <div className="col-span-1"></div>
                            </div>

                            {components.map((item, index) => {
                                const stockItem = inventory.find(i => i.sku === item.sku);
                                const maxQty = stockItem ? stockItem.quantity : 999;
                                
                                return ( 
                                <div key={item.tempId || item.id || index} className="grid grid-cols-12 gap-3 items-center border-b border-gray-800 pb-2">
                                    {/* Nome (ReadOnly) */}
                                    <div className="col-span-3 p-2 text-sm truncate">{item.name}</div>
                                    {/* SKU (ReadOnly) */}
                                    <div className="col-span-2 p-2 text-sm text-gray-500 truncate">{item.sku}</div>
                                    {/* Preço (Editável) */}
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.price || 0}
                                        onChange={(e) => handleUpdateComponent(index, 'price', e.target.value)}
                                        required
                                        className="col-span-2 p-2 rounded bg-[#1e293b] border border-gray-600 text-sm text-right"
                                        title={`Preço de custo original: ${formatBRL(stockItem?.price || 0)}`}
                                    />
                                    {/* Quantidade (Editável) */}
                                    <input
                                        type="number"
                                        min="1"
                                        max={maxQty}
                                        value={item.qty || 1}
                                        onChange={(e) => handleUpdateComponent(index, 'qty', e.target.value)}
                                        required
                                        className="col-span-2 p-2 rounded bg-[#1e293b] border border-gray-600 text-sm text-center"
                                        title={`Estoque disponível: ${maxQty}`}
                                    />
                                    {/* Subtotal */}
                                    <div className="col-span-2 text-right font-medium text-yellow-400 text-sm">
                                        {formatBRL((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0))}
                                    </div>
                                    {/* Remover */}
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveComponent(index)}
                                        className="col-span-1 p-2 rounded-full text-red-400 hover:bg-red-900/50 transition"
                                        title="Remover Item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                ) // FIM DO RETURN
                            })}
                        </div>

                    </div>

                    {/* Rodapé e Ações (sticky bottom-0 para fixar durante a rolagem) */}
                    <div className="p-6 flex justify-end gap-3 border-t border-gray-700 sticky bottom-0 bg-[#1e293b] z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold"
                        >
                            {isEditing ? "Salvar Pedido" : "Criar Pedido"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}