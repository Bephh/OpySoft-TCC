import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function AddItemModal({ onClose, onSave }) {
    
    const [formData, setFormData] = useState({
        component: '',
        sku: '',
        category: '', 
        quantity: 0,
        supplier: '',
        
        price: 0,
        power: 0,
        
        socket: '', 
        ramType: '', 
        watt: 0, 

        minStock: 20, 
        criticalStock: 5, 
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        let finalValue;
        if (type === 'number') {
            if (name === 'price') {
                finalValue = parseFloat(value) || 0;
            } else {
                finalValue = parseInt(value, 10) || 0; 
            }
        } else {
            finalValue = value;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Garante que todos os valores numéricos sejam parseados corretamente para o Firebase
        const payload = {
            ...formData,
            quantity: parseInt(formData.quantity, 10) || 0, 
            price: parseFloat(formData.price) || 0,
            power: parseInt(formData.power, 10) || 0,
            watt: parseInt(formData.watt, 10) || 0,
            minStock: parseInt(formData.minStock, 10) || 0,
            criticalStock: parseInt(formData.criticalStock, 10) || 0,
        };
        
        const savePromise = onSave(payload);
        
        if (savePromise && typeof savePromise.finally === 'function') {
            savePromise.finally(() => { 
                setIsSaving(false);
                onClose();
            });
        } else {
             setIsSaving(false);
             onClose();
        }
    };
    
    const inputStyle = "mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    const category = formData.category;
    const showSocket = category === 'CPU' || category === 'Placa-Mãe';
    const showRamType = category === 'RAM' || category === 'Placa-Mãe';
    const showWatt = category === 'Fonte';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#0b1220] p-8 rounded-2xl shadow-2xl shadow-blue-900/50 w-full max-w-xl max-h-[95vh] flex flex-col transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CABEÇALHO */}
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 mb-6 flex-shrink-0">
                    <h3 className="text-2xl font-extrabold text-blue-400">Adicionar Componente</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        disabled={isSaving}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* CONTEÚDO ROLÁVEL */}
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                    <form id="add-form" onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Linha 1: Componente e SKU */}
                        <div className="flex gap-5">
                            <div className="flex-1">
                                <label htmlFor="component" className="block text-sm font-semibold text-gray-300 mb-1">Nome do Componente</label>
                                <input type="text" name="component" id="component" value={formData.component} onChange={handleChange} required className={inputStyle} placeholder="Ex: Placa de Vídeo" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="sku" className="block text-sm font-semibold text-gray-300 mb-1">SKU (Código)</label>
                                <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className={inputStyle} placeholder="Ex: GPU-NVIDIA-4090" />
                            </div>
                        </div>

                        {/* SELETOR DE CATEGORIA */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-semibold text-gray-300 mb-1">Categoria do Componente</label>
                            <select
                                name="category"
                                id="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            >
                                <option value="" disabled>Selecione a Categoria</option>
                                <option value="CPU">Processador (CPU)</option>
                                <option value="Placa-Mãe">Placa-Mãe</option>
                                <option value="RAM">Memória RAM</option>
                                <option value="GPU">Placa de Vídeo (GPU)</option>
                                <option value="Armazenamento">Armazenamento</option>
                                <option value="Fonte">Fonte (PSU)</option>
                                <option value="Gabinete">Gabinete</option>
                                <option value="Cooler">Cooler</option> 
                            </select>
                        </div>

                        {/* Linha de Preço, Power e Qtd */}
                        <div className="grid grid-cols-3 gap-5">
                            <div>
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-300 mb-1">Preço de Custo (R$)</label>
                                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className={inputStyle} placeholder="Ex: 550.99" />
                            </div>
                            <div>
                                <label htmlFor="power" className="block text-sm font-semibold text-gray-300 mb-1">Consumo (Watts)</label>
                                <input type="number" name="power" id="power" value={formData.power} onChange={handleChange} required min="0" className={inputStyle} placeholder="Ex: 250" />
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-300 mb-1">Quantidade Atual</label>
                                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required min="0" className={inputStyle} />
                            </div>
                        </div>

                        {/* Linha de Campos de Compatibilidade Dinâmicos */}
                        {(showSocket || showRamType || showWatt) && (
                            <div className="pt-4 mt-2 border-t border-gray-700/50 space-y-3">
                                <p className="text-sm font-semibold text-blue-400">
                                    Especificações Técnicas
                                </p>
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
                                    {/* Adicionar espaços vazios conforme necessário */}
                                    {(showSocket && !showRamType && !showWatt) && <div className="col-span-2"></div>}
                                    {(showRamType && !showSocket && !showWatt) && <div className="col-span-2"></div>}
                                </div>
                            </div>
                        )}


                        {/* Fornecedor */}
                        <div className="pt-2"> 
                            <label htmlFor="supplier" className="block text-sm font-semibold text-gray-300 mb-1">Fornecedor</label>
                            <input type="text" name="supplier" id="supplier" value={formData.supplier} onChange={handleChange} required className={inputStyle} placeholder="Ex: NVIDIA Brasil" />
                        </div>

                        {/* Regras de Estoque */}
                        <div className="pt-4 mt-2 border-t border-gray-700/50 space-y-3">
                            <p className="text-sm font-semibold text-blue-400">
                                Regras de Estoque (Parâmetros de Alerta)
                            </p>

                            {/* Limites de Estoque Customizados */}
                            <div className="flex gap-5">
                                <div className="flex-1">
                                    <label htmlFor="minStock" className="block text-sm font-semibold text-gray-300 mb-1">Estoque Mínimo (Alerta Amarelo)</label>
                                    <input type="number" name="minStock" id="minStock" value={formData.minStock} onChange={handleChange} required min="1" className={inputStyle} />
                                    <p className="text-xs text-gray-500 mt-1">Quando a Qtd. for **abaixo** deste número, será "Estoque Baixo".</p>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="criticalStock" className="block text-sm font-semibold text-gray-300 mb-1">Estoque Crítico (Alerta Vermelho)</label>
                                    <input type="number" name="criticalStock" id="criticalStock" value={formData.criticalStock} onChange={handleChange} required min="0" className={inputStyle} />
                                    <p className="text-xs text-gray-500 mt-1">Quando a Qtd. for **abaixo** deste número, será "Estoque Crítico".</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div> 

                {/* RODAPÉ (com botão de submit) */}
                <div className="pt-6 flex justify-end gap-3 flex-shrink-0 border-t border-gray-700/50 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="py-3 px-6 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700/50 transition duration-150 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="add-form" 
                        disabled={isSaving}
                        className={`py-3 px-6 rounded-xl font-bold transition duration-150 flex items-center gap-2 ${
                            isSaving 
                                ? 'bg-blue-800 text-white opacity-70 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Salvar Item
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}