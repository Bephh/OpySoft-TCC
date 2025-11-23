// src/components/AddHardwareModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = [
    { value: 'ComputadorMontado', label: 'Computador Montado' },
    { value: 'Notebook', label: 'NoteBook' },
    { value: 'Monitor', label: 'Monitor' },
    { value: 'Mouse', label: 'Mouse' },
    { value: 'Teclado', label: 'Teclado' },
    { value: 'Microfone', label: 'Microfone' },
    { value: 'Cabo', label: 'Cabo' },
    { value: 'Outro', label: 'Outro Hardware/Periférico' },
];

export default function AddHardwareModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        component: '',
        category: CATEGORIES[0].value,
        sku: '',
        price: '',
        sellingPrice: '',
        supplier: '',
        quantity: '0',
        minStock: '20',
        criticalStock: '5',
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Permite vírgula para formatação no input de preço
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        if (!formData.component || !formData.price || !formData.category) {
            alert("Preencha o Nome, Preço de Custo e Categoria.");
            setSaving(false);
            return;
        }

        // Conversão de Strings para Números, tratando vírgula
        const dataToSave = {
            ...formData,
            // Substitui vírgula por ponto para conversão correta para float
            price: parseFloat(formData.price.replace(',', '.')) || 0,
            sellingPrice: parseFloat(formData.sellingPrice.replace(',', '.')) || 0,
            // Converte quantidades para números inteiros
            quantity: parseInt(formData.quantity) || 0,
            minStock: parseInt(formData.minStock) || 20,
            criticalStock: parseInt(formData.criticalStock) || 5,
        };

        // Passa os dados convertidos para a função onSave do Montados.jsx
        await onSave(dataToSave);
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1e293b] rounded-xl shadow-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <header className="p-5 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-[#1e293b]">
                    <h3 className="text-xl font-bold text-blue-400">Adicionar Novo Hardware</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Linha 1: Nome do Componente */}
                    <div>
                        <label htmlFor="component" className="block text-sm font-medium text-gray-300 mb-1">Nome do Hardware / Componente *</label>
                        <input
                            type="text"
                            id="component"
                            name="component"
                            value={formData.component}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Linha 2: Categoria e SKU */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Tipo / Categoria *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium text-gray-300 mb-1">SKU / Código do Produto</label>
                            <input
                                type="text"
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white"
                            />
                        </div>
                    </div>

                    {/* Linha 3: Preço Custo e Preço Venda */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Preço de Custo (R$)</label>
                            <input
                                type="text"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0,00"
                                required
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-300 mb-1">Preço de Venda Sugerido (R$)</label>
                            <input
                                type="text"
                                id="sellingPrice"
                                name="sellingPrice"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                placeholder="0,00"
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white"
                            />
                        </div>
                    </div>

                    {/* Linha 4: Fornecedor e Quantidade Inicial */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-gray-300 mb-1">Fornecedor</label>
                            <input
                                type="text"
                                id="supplier"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Quantidade Inicial</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="0"
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white"
                            />
                        </div>
                    </div>

                    {/* Linha 5: Estoques Mínimo e Crítico */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="minStock" className="block text-sm font-medium text-gray-300 mb-1">Estoque Mínimo (Alerta Amarelo)</label>
                            <input
                                type="number"
                                id="minStock"
                                name="minStock"
                                value={formData.minStock}
                                onChange={handleChange}
                                min="0"
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="criticalStock" className="block text-sm font-medium text-gray-300 mb-1">Estoque Crítico (Alerta Vermelho)</label>
                            <input
                                type="number"
                                id="criticalStock"
                                name="criticalStock"
                                value={formData.criticalStock}
                                onChange={handleChange}
                                min="0"
                                className="w-full bg-[#0b1220] border border-gray-700 rounded-lg p-3 text-white"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-150 disabled:opacity-50 mt-4"
                    >
                        {saving ? 'Salvando...' : 'Salvar Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}