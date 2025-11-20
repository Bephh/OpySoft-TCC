import React, { useState } from 'react';

export default function AddOrderModal({ initialData, onClose, onFinalize, isFromMontados = false }) {
    const [clientName, setClientName] = useState('');
    const [status, setStatus] = useState(initialData.status || 'Pendente');
    const [notes, setNotes] = useState(initialData.notes || 'Pedido gerado automaticamente pelo Montador de PC.');

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(initialData.suggestedPrice);

    const formattedCost = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(initialData.costPrice);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!clientName.trim()) {
            alert('Por favor, informe o nome do cliente.');
            return;
        }

        const finalOrderData = {
            ...initialData,
            clientName: clientName.trim(),
            status: status,
            notes: notes.trim(),
        };

        onFinalize(finalOrderData);
    };

    // ✅ 2. LÓGICA DE VALIDAÇÃO CORRIGIDA
    // Se vier da página 'Montados', permite 8 ou mais componentes.
    // Se não, exige exatamente 8.
    const isButtonDisabled = isFromMontados
        ? initialData.components.length < 8
        : initialData.components.length !== 8;

    const errorMessage = isFromMontados
        ? "O PC deve ter pelo menos 8 componentes principais."
        : "Você deve selecionar todos os 8 componentes para finalizar o pedido.";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] text-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                <h2 className="text-3xl font-bold mb-4 text-blue-400">Finalizar Pedido da Montagem</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="p-3 bg-gray-700/50 rounded">
                        <p className="text-xl font-bold">Total Sugerido: <span className="text-green-400">{formattedPrice}</span></p>
                        <p className="text-sm text-gray-400">Custo: {formattedCost} | Lucro: {initialData.profitMargin}%</p>
                        <p className="text-sm text-gray-400">Itens: {initialData.components.length}</p>
                    </div>

                    <div>
                        <label htmlFor="clientName" className="block text-sm font-medium mb-1">Nome do Cliente <span className="text-red-500">*</span></label>
                        <input
                            id="clientName"
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-[#0f172a] border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: João da Silva"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-1">Status do Pedido</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 rounded bg-[#0f172a] border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Pendente">Pendente</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-1">Notas</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            className="w-full p-2 rounded bg-[#0f172a] border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 rounded-lg hover:bg-gray-600 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                            // ✅ 3. USANDO A NOVA VARIÁVEL DE VALIDAÇÃO
                            disabled={isButtonDisabled}
                        >
                            Finalizar e Dar Baixa no Estoque
                        </button>
                    </div>
                </form>
                {/* ✅ 4. MOSTRANDO A MENSAGEM DE ERRO CORRETA */}
                {isButtonDisabled && (
                    <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                )}
            </div>
        </div>
    );
}