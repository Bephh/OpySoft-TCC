// src/components/EditPCModal.jsx

import React, { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { db } from '../firebase-config';
import { collection, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

const formatBRL = (value) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export default function EditPCModal({ pc, onClose, onSave }) {
    const { currentUser } = useAuth();

    const [quantity, setQuantity] = useState(pc.quantity || '0');
    const [profit, setProfit] = useState(pc.profitMargin || 0);
    const [peripherals, setPeripherals] = useState(
        pc.components.filter(c => c.categoryKey === 'peripheral' || c.category === 'Periférico')
    );
    const [availablePeripherals, setAvailablePeripherals] = useState([]);
    const [loading, setLoading] = useState(true);

    const coreCost = pc.components
        .filter(c => c.categoryKey !== 'peripheral' && c.category !== 'Periférico')
        .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    const peripheralCost = peripherals.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    const updatedCostPrice = coreCost + peripheralCost;
    const suggestedPrice = updatedCostPrice * (1 + (Number(profit) / 100));

    useEffect(() => {
        if (!currentUser?.uid) return;
        const inventoryCollectionRef = collection(db, 'empresas', currentUser.uid, 'inventario');
        const q = query(inventoryCollectionRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                price: parseFloat(doc.data().price) || 0,
            })).filter(item =>
                item.category === 'Periférico' &&
                parseFloat(item.quantity) > 0
            );
            setAvailablePeripherals(items);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao carregar periféricos:", error);
            setLoading(false);
        });
        return unsubscribe;
    }, [currentUser]);

    const handlePeripheralChange = (itemId, action) => {
        if (action === 'add') {
            const newPeripheral = availablePeripherals.find(p => p.id === itemId);
            if (newPeripheral && !peripherals.some(p => p.id === itemId)) {
                setPeripherals(prev => [...prev, {
                    category: 'Periférico', categoryKey: 'peripheral', id: newPeripheral.id,
                    name: newPeripheral.component, price: String(newPeripheral.price || 0),
                    sku: newPeripheral.sku || 'N/A', qty: 1,
                }]);
            }
        } else if (action === 'remove') {
            setPeripherals(prev => prev.filter(p => p.id !== itemId));
        }
    };

    const handleSave = () => {
        const coreComponents = pc.components.filter(c => c.categoryKey !== 'peripheral' && c.category !== 'Periférico');
        const newComponentsList = [...coreComponents, ...peripherals];
        const updatedData = {
            quantity: String(quantity),
            costPrice: String(updatedCostPrice),
            profitMargin: Number(profit),
            suggestedPrice: String(suggestedPrice),
            components: newComponentsList,
            dataUltimaEdicao: serverTimestamp(),
        };
        onSave(pc.id, updatedData);
    };

    return (
        // ✅ O modal em si agora usa 'items-center' para centralizar verticalmente
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            {/* ✅ O container principal do conteúdo agora tem uma largura máxima e altura máxima para evitar que ocupe a tela toda */}
            <div className="bg-[#1e293b] text-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

                <div className="flex justify-between items-center p-6 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-blue-400">Editar PC: {pc.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={24} /></button>
                </div>

                {/* ✅ Container para o conteúdo rolável */}
                <div className="overflow-y-auto p-6">
                    {loading ? (
                        <p>Carregando...</p>
                    ) : (
                        // ✅ Layout principal dividido em 2 colunas em telas médias (md) ou maiores
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Coluna da Esquerda: Cálculos e Preços */}
                            <div className="space-y-4">
                                <div className="bg-[#0f172a] p-4 rounded-lg space-y-3 border border-gray-700">
                                    <label className="block text-sm font-medium">Margem de Lucro (%)</label>
                                    <input type="number" value={profit} onChange={(e) => setProfit(e.target.value)} min="0" className="w-full p-2 rounded bg-[#1e293b] border border-gray-600 text-lg text-center" />
                                </div>
                                <div className="bg-[#0f172a] p-4 rounded-lg space-y-3 border border-gray-700">
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>Custo Base (Componentes):</span>
                                        <span className="font-semibold">{formatBRL(coreCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>Custo Periféricos Adicionais:</span>
                                        <span className="font-semibold">{formatBRL(peripheralCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold border-t border-gray-600 pt-3">
                                        <span>Custo Total Atualizado:</span>
                                        <span className="text-yellow-400 text-lg">{formatBRL(updatedCostPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-extrabold text-2xl pt-2">
                                        <span>Preço Sugerido de Venda:</span>
                                        <span className="text-green-400">{formatBRL(suggestedPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna da Direita: Estoque e Periféricos */}
                            <div className="space-y-4">
                                <div className="bg-[#0f172a] p-4 rounded-lg space-y-3 border border-gray-700">
                                    <label className="block text-sm font-medium">Quantidade em Estoque</label>
                                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" className="w-full p-2 rounded bg-[#1e293b] border border-gray-600 text-lg text-center" />
                                </div>
                                <div className="bg-[#0f172a] p-4 rounded-lg space-y-4 border border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-200">Gerenciar Periféricos</h3>
                                    <select onChange={(e) => handlePeripheralChange(e.target.value, 'add')} value="" className="bg-[#1e293b] p-2 rounded text-sm flex-grow border border-gray-600 w-full">
                                        <option value="">Adicionar Periférico Disponível...</option>
                                        {availablePeripherals.map(item => (
                                            <option key={item.id} value={item.id} disabled={peripherals.some(p => p.id === item.id)}>
                                                {item.component} - {formatBRL(item.price)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {peripherals.map(item => (
                                            <div key={item.id} className="flex justify-between items-center bg-[#1e293b] p-3 rounded-lg border border-gray-700">
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-yellow-400">{formatBRL(item.price)}</span>
                                                    <button onClick={() => handlePeripheralChange(item.id, 'remove')} className="text-red-400 hover:text-red-300 p-1 rounded-full">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {peripherals.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhum periférico adicionado.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ Rodapé fixo na parte inferior do modal */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition font-semibold">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold" disabled={loading}>
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
