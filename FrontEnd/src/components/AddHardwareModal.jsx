import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

// nao esta funcional ainda
// nao esta funcional ainda
// nao esta funcional ainda
// nao esta funcional ainda
// nao esta funcional ainda
// nao esta funcional ainda
// nao esta funcional ainda


export default function AddHardwareModal({ onClose, onSave }) {
    
    const [formData, setFormData] = useState({
        component: '',
        sku: '',
        category: '', 
        quantity: 0,
        supplier: '',
        
        price: 0,
        sellingPrice: 0, // <--- ADICIONADO: Preço de Venda Sugerido
        
        polegadas: 0,
        hz: 0,
        configuracoes: '',

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
            // <--- MODIFICADO: Incluindo sellingPrice no parseamento de float
            if (name === 'price' || name === 'sellingPrice') { 
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
        
        const payload = {
            ...formData,
            
            polegadas: parseInt(formData.polegadas, 10) || 0,
            hz: parseInt(formData.hz, 10) || 0,
            
            quantity: parseInt(formData.quantity, 10) || 0, 
            price: parseFloat(formData.price) || 0,
            sellingPrice: parseFloat(formData.sellingPrice) || 0, // <--- ADICIONADO ao payload
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
    const textareaStyle = "mt-1 block w-full bg-[#1e293b] border border-gray-700 rounded-lg shadow-inner p-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150 h-32 resize-y";

    const category = formData.category;
    const showMonitorSpecs = category === 'Monitor';
    const showGeneralSpecs = category === 'ComputadorMontado' || category === 'Notebook';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#0b1220] p-8 rounded-2xl shadow-2xl shadow-blue-900/50 w-full max-w-xl max-h-[95vh] flex flex-col transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 mb-6 flex-shrink-0">
                    <h3 className="text-2xl font-extrabold text-blue-400">Adicionar Hardware Montado/Periférico</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        disabled={isSaving}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                    <form id="add-form" onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Linha 1: Hardware e SKU */}
                        <div className="flex gap-5">
                            <div className="flex-1">
                                <label htmlFor="component" className="block text-sm font-semibold text-gray-300 mb-1">Nome do Hardware</label>
                                <input type="text" name="component" id="component" value={formData.component} onChange={handleChange} required className={inputStyle} placeholder="Ex: PC Gamer Z ou Teclado Mecânico" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="sku" className="block text-sm font-semibold text-gray-300 mb-1">SKU (Código)</label>
                                <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className={inputStyle} placeholder="Ex: PCG-RYZEN-7" />
                            </div>
                        </div>

                        {/* SELETOR DE CATEGORIA */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-semibold text-gray-300 mb-1">Categoria do Hardware</label>
                            <select
                                name="category"
                                id="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            >
                                <option value="" disabled>Selecione a Categoria</option>
                                <option value="ComputadorMontado">Computador Montado</option>
                                <option value="Notebook">NoteBook</option>
                                <option value="Monitor">Monitor</option>
                                <option value="Mouse">Mouse</option>
                                <option value="Teclado">Teclado</option>
                                <option value="Microfone">Microfone</option>
                                <option value="Cabo">Cabo</option> 
                                <option value="Outro">Outro Hardware/Periférico</option>
                            </select>
                        </div>

                        {/* Linha 3: Preços (Custo e Venda Sugerido) <--- NOVO LAYOUT */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-300 mb-1">Preço de Custo (R$)</label>
                                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className={inputStyle} placeholder="Ex: 550.99" />
                            </div>
                            <div>
                                <label htmlFor="sellingPrice" className="block text-sm font-semibold text-gray-300 mb-1">Preço de Venda Sugerido (R$)</label>
                                <input type="number" name="sellingPrice" id="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required min="0" step="0.01" className={inputStyle} placeholder="Ex: 799.99" />
                            </div>
                        </div>

                        {/* Linha 4: Quantidade Atual (movida para cá) */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-300 mb-1">Quantidade Atual</label>
                            <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required min="0" className={inputStyle} />
                        </div>
                        
                        {/* Bloco de Especificações (Mantido) */}
                        {(showMonitorSpecs || showGeneralSpecs) && (
                            <div className="pt-4 mt-2 border-t border-gray-700/50 space-y-5">
                                <p className="text-sm font-semibold text-blue-400">
                                    Especificações Técnicas
                                </p>
                                
                                {showGeneralSpecs && (
                                    <div>
                                        <label htmlFor="configuracoes" className="block text-sm font-semibold text-gray-300 mb-1">Configurações (PC Montado ou Notebook)</label>
                                        <textarea 
                                            name="configuracoes" 
                                            id="configuracoes" 
                                            value={formData.configuracoes} 
                                            onChange={handleChange} 
                                            required={showGeneralSpecs}
                                            className={textareaStyle} 
                                            placeholder="Ex: CPU: Ryzen 5, GPU: RTX 4060, RAM: 16GB DDR5..."
                                        />
                                    </div>
                                )}
                                
                                {showMonitorSpecs && (
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="polegadas" className="block text-sm font-semibold text-gray-300 mb-1">Polegadas (")</label>
                                            <input type="number" name="polegadas" id="polegadas" value={formData.polegadas} onChange={handleChange} required={showMonitorSpecs} min="1" className={inputStyle} placeholder="Ex: 27" />
                                        </div>
                                        <div>
                                            <label htmlFor="hz" className="block text-sm font-semibold text-gray-300 mb-1">Frequência (Hz)</label>
                                            <input type="number" name="hz" id="hz" value={formData.hz} onChange={handleChange} required={showMonitorSpecs} min="60" className={inputStyle} placeholder="Ex: 144" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        <div className="pt-2"> 
                            <label htmlFor="supplier" className="block text-sm font-semibold text-gray-300 mb-1">Fornecedor</label>
                            <input type="text" name="supplier" id="supplier" value={formData.supplier} onChange={handleChange} required className={inputStyle} placeholder="Ex: Kabum ou Pichau" />
                        </div>

                        {/* Regras de Estoque (Mantido) */}
                        <div className="pt-4 mt-2 border-t border-gray-700/50 space-y-3">
                            <p className="text-sm font-semibold text-blue-400">
                                Regras de Estoque (Parâmetros de Alerta)
                            </p>

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