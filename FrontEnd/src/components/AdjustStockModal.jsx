// src/components/AdjustStockModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function AdjustStockModal({ onClose, itemToEdit, onUpdate }) {

    const [formData, setFormData] = useState({
        component: '', sku: '', category: '', quantity: 0, supplier: '',
        price: 0, estimatedPower: 0, socket: '', ramType: '', watt: 0,
        minStock: 20, criticalStock: 5,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                component: itemToEdit.component || '',
                sku: itemToEdit.sku || '',
                category: itemToEdit.category || '',
                quantity: itemToEdit.quantity || 0,
                supplier: itemToEdit.supplier || '',
                price: itemToEdit.price || 0,
                estimatedPower: itemToEdit.estimatedPower || itemToEdit.power || 0,
                socket: itemToEdit.socket || '',
                ramType: itemToEdit.ramType || '',
                watt: itemToEdit.watt || 0,
                minStock: itemToEdit.minStock || 20,
                criticalStock: itemToEdit.criticalStock || 5,
            });
        }
    }, [itemToEdit]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (typeof onUpdate !== 'function') {
            console.error("Erro: onUpdate não é uma função!", onUpdate);
            alert("Erro de configuração do componente. A função de atualização não foi encontrada.");
            return;
        }
        setIsSaving(true);

        const payload = {
            id: itemToEdit.id,
            ...formData,
        };

        try {
            await onUpdate(payload);
        } catch (error) {
            console.error("Falha na chamada onUpdate:", error);
        } finally {
            setIsSaving(false);
            // O fechamento do modal agora é controlado pelo componente pai (Inventario.jsx)
        }
    };

    const inputStyle = "mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150";
    const category = formData.category;
    const showSocket = category === 'CPU' || category === 'Placa-Mãe';
    const showRamType = category === 'RAM' || category === 'Placa-Mãe';
    const showWatt = category === 'Fonte';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[#0b1220] p-8 rounded-2xl shadow-2xl shadow-blue-900/50 w-full max-w-3xl max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 mb-6 flex-shrink-0">
                    <h3 className="text-2xl font-extrabold text-blue-400">Editar/Ajustar Estoque: {itemToEdit?.component}</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition" disabled={isSaving}>
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 custom-scrollbar">
                    <form id="adjust-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* ✅ LAYOUT CORRIGIDO: Usando um grid de 6 colunas para alinhamento perfeito */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Nome do Componente</label>
                                <input type="text" value={formData.component} readOnly className={`${inputStyle} opacity-70 cursor-not-allowed`} />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-300 mb-1">SKU (Código)</label>
                                <input type="text" value={formData.sku} readOnly className={`${inputStyle} opacity-70 cursor-not-allowed`} />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-300 mb-1">Quantidade Atual</label>
                                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required min="0" className={inputStyle} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-300 mb-1">Preço de Custo (R$)</label>
                                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className={inputStyle} placeholder="Ex: 550.99" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="estimatedPower" className="block text-sm font-semibold text-gray-300 mb-1">Consumo (Watts)</label>
                                <input type="number" name="estimatedPower" id="estimatedPower" value={formData.estimatedPower} onChange={handleChange} required min="0" className={inputStyle} placeholder="Ex: 250" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="supplier" className="block text-sm font-semibold text-gray-300 mb-1">Fornecedor</label>
                            <input type="text" name="supplier" id="supplier" value={formData.supplier} onChange={handleChange} required className={inputStyle} placeholder="Ex: NVIDIA Brasil" />
                        </div>

                        {(showSocket || showRamType || showWatt) && (
                            <div className="pt-4 mt-2 border-t border-gray-700/50 space-y-3">
                                <p className="text-sm font-semibold text-blue-400">Especificações Técnicas</p>
                                <div className="grid grid-cols-3 gap-5">
                                    {showSocket && (
                                        <div>
                                            <label htmlFor="socket" className="block text-sm font-semibold text-gray-300 mb-1">Socket/Conector</label>
                                            <input type="text" name="socket" id="socket" value={formData.socket} onChange={handleChange} className={inputStyle} placeholder="Ex: AM5 ou LGA 1700" />
                                        </div>
                                    )}
                                    {showRamType && (
                                        <div>
                                            <label htmlFor="ramType" className="block text-sm font-semibold text-gray-300 mb-1">Tipo de RAM</label>
                                            <input type="text" name="ramType" id="ramType" value={formData.ramType} onChange={handleChange} className={inputStyle} placeholder="Ex: DDR5 ou DDR4" />
                                        </div>
                                    )}
                                    {showWatt && (
                                        <div>
                                            <label htmlFor="watt" className="block text-sm font-semibold text-gray-300 mb-1">Capacidade da Fonte (W)</label>
                                            <input type="number" name="watt" id="watt" value={formData.watt} onChange={handleChange} className={inputStyle} placeholder="Ex: 750" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 mt-2 border-t border-gray-700/50 space-y-3">
                            <p className="text-sm font-semibold text-blue-400">Regras de Estoque (Parâmetros de Alerta)</p>
                            <div className="flex gap-5">
                                <div className="flex-1">
                                    <label htmlFor="minStock" className="block text-sm font-semibold text-gray-300 mb-1">Estoque Mínimo</label>
                                    <input type="number" name="minStock" id="minStock" value={formData.minStock} onChange={handleChange} required min="1" className={inputStyle} />
                                    <p className="text-xs text-gray-500 mt-1">Alerta Amarelo</p>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="criticalStock" className="block text-sm font-semibold text-gray-300 mb-1">Estoque Crítico</label>
                                    <input type="number" name="criticalStock" id="criticalStock" value={formData.criticalStock} onChange={handleChange} required min="0" className={inputStyle} />
                                    <p className="text-xs text-gray-500 mt-1">Alerta Vermelho</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="pt-6 flex justify-end gap-3 flex-shrink-0 border-t border-gray-700/50 mt-4">
                    <button type="button" onClick={onClose} disabled={isSaving} className="py-3 px-6 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700/50 transition duration-150 font-medium">
                        Cancelar
                    </button>
                    <button type="submit" form="adjust-form" disabled={isSaving} className={`py-3 px-6 rounded-xl font-bold transition duration-150 flex items-center gap-2 ${isSaving ? 'bg-blue-800 text-white opacity-70 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30'}`}>
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Atualizando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
