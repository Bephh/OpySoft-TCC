import React, { useState, useEffect } from 'react';
import { useFinancas } from '../hooks/useFinancas';
import { useCompletedOrders } from '../hooks/useCompletedOrders';

const formatToInput = (value) => {
    if (typeof value === 'string') {
        value = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    }
    return parseFloat(value) || '';
};


export default function EditTransactionModal({ onClose, transactionToEdit }) {
    const { atualizarTransacao } = useFinancas();
    const { orders, loading, error: ordersError } = useCompletedOrders();

    const [tipo, setTipo] = useState(transactionToEdit.tipo || 'Receita');
    const [descricao, setDescricao] = useState(transactionToEdit.descricao || '');
    const [valor, setValor] = useState(transactionToEdit.valor || '');
    const [pedidoSelecionado, setPedidoSelecionado] = useState(transactionToEdit.pedidoId || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSelectOrder = (e) => {
        const selectedId = e.target.value;
        setPedidoSelecionado(selectedId);

        if (selectedId) {
            const selectedOrder = orders.find(o => o.id === selectedId);
            if (selectedOrder) {
                setTipo('Receita');
                setDescricao(`Faturamento Pedido #${selectedOrder.id.substring(0, 6)} - Cliente: ${selectedOrder.cliente}`);
                setValor(formatToInput(selectedOrder.total));
            }
        } else {
            // Não limpa ao deselecionar na edição, a menos que você queira
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const numValor = parseFloat(valor);
        if (!descricao || !numValor || numValor <= 0) {
            setError("Preencha a descrição e um valor numérico válido.");
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            await atualizarTransacao(transactionToEdit.id, {
                tipo,
                valor: numValor,
                descricao,
                pedidoId: pedidoSelecionado || null,
            });
            onClose();
        } catch (e) {
            console.error("Erro no onSave do EditTransactionModal:", e);
            setError(e.message || "Erro desconhecido ao atualizar.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSave} className="bg-[#1e293b] rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700 text-white space-y-4">
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Editar Transação</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-400">
                        Vincular a Pedido Concluído (Opcional)
                    </label>
                    <select
                        value={pedidoSelecionado}
                        onChange={handleSelectOrder}
                        disabled={loading}
                        className="w-full p-2.5 bg-[#0f172a] rounded-lg border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">{loading ? 'Carregando pedidos...' : 'Selecionar um Pedido...'}</option>
                        {ordersError && <option disabled className="text-red-400">🚨 {ordersError}</option>}
                        {!loading && !ordersError && orders.length === 0 && <option disabled>Nenhum pedido concluído encontrado</option>}
                        {orders.map((order) => (
                            <option key={order.id} value={order.id}>
                                #{order.id.substring(0, 6)} - Cliente: {order.cliente} - R$ {order.total} ({order.data})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setTipo('Receita')}
                            className={`flex-1 py-2 rounded-lg transition ${tipo === 'Receita' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('Despesa')}
                            className={`flex-1 py-2 rounded-lg transition ${tipo === 'Despesa' ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                        >
                            Despesa
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
                    <input
                        id="descricao"
                        type="text"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="w-full p-3 bg-[#0f172a] border border-gray-600 rounded-lg text-white"
                        disabled={isSaving}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="valor" className="block text-sm font-medium text-gray-300 mb-1">Valor (R$)</label>
                    <input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className="w-full p-3 bg-[#0f172a] border border-gray-600 rounded-lg text-white"
                        disabled={isSaving}
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex justify-end space-x-4 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition" disabled={isSaving}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
}