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

    // Estado do Pedido
    const [client, setClient] = useState(orderToEdit?.clientName || orderToEdit?.client || "");
    const [status, setStatus] = useState(orderToEdit?.status || "Pendente");
    const [notes, setNotes] = useState(orderToEdit?.notes || "");
    // Garante que cada item tenha um ID temporário único para o React
    const [components, setComponents] = useState(
        orderToEdit?.components.map(comp => ({
            ...comp,
            tempId: comp.id || `${Math.random()}-${Date.now()}` // Adiciona tempId se faltar
        })) || []
    );

    const [profitMargin, setProfitMargin] = useState(orderToEdit?.profitMargin || 20);

    // Estado do Inventário
    const [inventory, setInventory] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState("");
    const [loadingInventory, setLoadingInventory] = useState(true);

    const orderStatuses = ["Pendente", "Processando", "Enviados", "Entregues", "Cancelado"];

    // Cálculo do Custo Total
    const costPrice = components.reduce((sum, item) =>
        sum + ((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)), 0);

    // Cálculo do Preço Sugerido (Total da Venda)
    const suggestedPrice = costPrice * (1 + (Number(profitMargin) / 100));

    // Carrega Inventário
    useEffect(() => {
        if (!currentUser?.uid) {
            setLoadingInventory(false);
            return;
        }

        // Caminho do Inventário: empresas/{userId}/inventario
        const q = query(collection(db, 'empresas', currentUser.uid, 'inventario'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id, // ID do Documento do Firestore (essencial para a chave e a busca)
                ...doc.data(),
                component: doc.data().component || doc.data().name || 'Item sem nome', // Garante que o nome exista
            }));

            // Filtra itens com IDs duplicados (redundância de segurança)
            const uniqueIds = new Set();
            const uniqueItems = items.filter(item => {
                if (uniqueIds.has(item.id)) return false;
                uniqueIds.add(item.id);
                return true;
            });

            setInventory(uniqueItems);
            setLoadingInventory(false);
        }, (error) => {
            console.error("Erro ao carregar inventário no modal:", error);
            setLoadingInventory(false);
        });

        return unsubscribe;
    }, [currentUser]);

    // Lógica para adicionar item ao pedido
    const handleAddComponent = () => {
        if (!selectedItemId) {
            alert("Selecione um item do inventário para adicionar.");
            return;
        }

        // Busca o item no inventário pelo seu ID
        const selectedItem = inventory.find(item => item.id === selectedItemId);
        if (!selectedItem) return;

        // Verifica se o item já está no pedido usando o ID
        const existingIndex = components.findIndex(item => item.id === selectedItemId);

        // MaxQty: quantidade atual em estoque
        const maxQty = selectedItem.quantity || 0;

        // Verifica se o pedido já está em status de consumo/cancelado.
        const isCompletedOrCancelled = status === 'Entregues' || status === 'Cancelado' || status === 'Enviados';

        if (existingIndex !== -1) {
            const newComponents = [...components];
            const currentQtyInOrder = parseInt(newComponents[existingIndex].qty) || 0;
            const newQty = currentQtyInOrder + 1;

            // Se o pedido não estiver em status de consumo, checa o estoque
            if (!isCompletedOrCancelled && newQty > maxQty) {
                alert(`Estoque máximo para ${selectedItem.component} atingido (${maxQty}).`);
            } else {
                newComponents[existingIndex].qty = newQty;
                setComponents(newComponents);
                if (isCompletedOrCancelled) {
                    console.warn("Item adicionado a um pedido de status finalizado/cancelado. Isso não afetará o estoque.");
                }
            }
        } else {
            // Nova adição
            if (!isCompletedOrCancelled && maxQty <= 0) {
                alert(`O item ${selectedItem.component} está sem estoque. Não pode ser adicionado.`);
                return;
            }

            setComponents([...components, {
                // Usar selectedItem.id como o ID do componente do pedido.
                id: selectedItem.id,
                sku: selectedItem.sku || "N/A",
                name: selectedItem.component,
                price: parseFloat(selectedItem.price) || 0, // Preço inicial do estoque
                qty: 1, // Começa com 1
                // Chave temporária para o React na Tabela
                tempId: selectedItem.id, // Revertemos para o ID do item, pois ele é único no inventário.
            }]);
        }

        // Limpa a seleção
        setSelectedItemId("");
    };

    // Lógica para atualizar quantidade/preço de um item existente
    const handleUpdateComponent = (index, field, value) => {
        const newComponents = [...components];
        let val = value;
        const itemToUpdate = newComponents[index];

        // Busca o item no estoque para checar a quantidade máxima
        const stockItem = inventory.find(i => i.id === itemToUpdate.id);
        const maxQty = stockItem ? stockItem.quantity : 999;

        const isConsumption = status === 'Enviados' || status === 'Entregues';
        const isCancelled = status === 'Cancelado';


        if (field === 'qty') {
            val = parseInt(value) || 0;
            if (val < 1) val = 1; // Não permite quantidade zero ou negativa

            // Se o pedido não estiver em status de consumo/cancelado, checa o estoque
            if (!isConsumption && !isCancelled) {
                if (val > maxQty) {
                    alert(`A quantidade máxima permitida é ${maxQty} (estoque).`);
                    val = maxQty;
                }
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

    // Lógica de Submissão do Formulário
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
            id: orderToEdit?.id, // Presente se estiver editando
            clientName: client.trim(),
            total: suggestedPrice,
            costPrice: costPrice,
            profitMargin: Number(profitMargin),
            status: status,
            notes: notes.trim(),
            // CORREÇÃO: Filtra o campo 'tempId' (interno) e remove campos nulos/undefined antes de salvar.
            components: components.map(({ tempId, ...rest }) => rest).map(item => {
                // Garante que nenhum campo seja 'undefined' ou 'null' para o Firestore
                return Object.fromEntries(
                    Object.entries(item).filter(([_, value]) => value !== undefined && value !== null)
                );
            }),
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">

            <div className="bg-[#1e293b] text-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-[#1e293b] z-10">
                    <h2 className="text-2xl font-bold text-blue-400">
                        {isEditing ? `Detalhes/Editar Pedido ${orderToEdit.id?.substring(0, 6)}...` : "Novo Pedido Manual"}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">

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
                                    placeholder="Nome do Cliente"
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
                                    placeholder="Margem de Lucro"
                                />
                            </div>

                            {/* Resumo de Custos */}
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-400">Custo: <span className="text-red-400 font-bold">{formatBRL(costPrice)}</span></p>
                                <p className="text-base font-bold text-gray-300">Total Venda: <span className="text-green-400">{formatBRL(suggestedPrice)}</span></p>
                            </div>
                        </div>

                        {/* Seletor de Componentes */}
                        <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-semibold mb-3 text-gray-300">Itens do Pedido</h3>
                            <div className="flex gap-4 mb-4">
                                <select
                                    value={selectedItemId}
                                    onChange={(e) => setSelectedItemId(e.target.value)}
                                    className="flex-grow p-2 rounded bg-[#1e293b] border border-gray-600"
                                >
                                    <option value="">Selecione um item...</option>
                                    {inventory.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {/* Usamos o ID do Firestore como a chave */}
                                            {item.component} (SKU: {item.sku || 'N/A'}) - Estoque: {item.quantity}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddComponent}
                                    className="flex items-center gap-1 bg-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    <Plus size={18} /> Adicionar
                                </button>
                            </div>

                            {/* Tabela de Componentes */}
                            <div className="overflow-x-auto max-h-60">
                                <table className="min-w-full text-left text-sm text-gray-300">
                                    <thead className="text-gray-400 bg-[#1e293b] sticky top-0">
                                        <tr>
                                            <th className="py-2 px-4 font-normal w-1/4">Item</th>
                                            <th className="py-2 px-4 font-normal w-1/4">SKU/ID</th>
                                            <th className="py-2 px-4 font-normal w-1/6">Qtd.</th>
                                            <th className="py-2 px-4 font-normal w-1/6">Preço Unit.</th>
                                            <th className="py-2 px-4 font-normal w-1/6">Subtotal</th>
                                            <th className="py-2 px-4 font-normal w-1/12">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {components.map((item, index) => (
                                            <tr key={item.tempId || item.id} className="border-t border-gray-700/50 hover:bg-[#1e293b]">
                                                <td className="py-3 px-4">{item.name}</td>
                                                <td className="py-3 px-4 text-xs font-mono text-gray-400">{item.sku || item.id.substring(0, 6)}...</td>
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.qty}
                                                        onChange={(e) => handleUpdateComponent(index, 'qty', e.target.value)}
                                                        className="w-16 p-1 rounded bg-[#0f172a] border border-gray-600 text-center"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.price}
                                                        onChange={(e) => handleUpdateComponent(index, 'price', e.target.value)}
                                                        className="w-24 p-1 rounded bg-[#0f172a] border border-gray-600 text-right"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-green-400">
                                                    {formatBRL((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0))}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveComponent(index)}
                                                        className="text-red-400 hover:text-red-600 transition p-1 rounded"
                                                        title="Remover Item"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Observações/Notas do Pedido (Opcional)"
                                className="w-full p-2 mt-4 rounded bg-[#1e293b] border border-gray-600 min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-[#1e293b] z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-gray-600 font-semibold hover:bg-gray-700 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-green-600 font-semibold hover:bg-green-700 transition"
                        >
                            {isEditing ? "Salvar Alterações" : "Criar Pedido"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}