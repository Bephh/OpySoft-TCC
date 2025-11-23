// src/utils/estoqueUtils.js

import { db } from '../firebase-config';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

/**
 * Atualiza o estoque de múltiplos itens em uma transação atômica, seguindo a regra do Firestore.
 * @param {Array<Object>} items Array de objetos: { id: string, qty: number } ou { id: string, quantity: number }
 * @param {string} userId ID do usuário/empresa.
 * @param {number} multiplier Multiplicador: -1 para CONSUMO/DEDUÇÃO, 1 para RETORNO/ESTORNO.
 * @returns {Promise<boolean>} True se a transação for bem-sucedida.
 */
export const updateStockTransaction = async (items, userId, multiplier) => {
    if (!items || items.length === 0) return true;
    if (multiplier !== 1 && multiplier !== -1) {
        throw new Error("Multiplicador inválido. Use 1 para retorno ou -1 para consumo.");
    }
    if (!userId) {
        throw new Error("ID do usuário não fornecido para a transação de estoque.");
    }

    try {
        await runTransaction(db, async (transaction) => {
            // ✅ ETAPA 1: LEITURA (READS)
            // Array para guardar as informações necessárias para as futuras escritas.
            const updatesToPerform = [];

            // Primeiro, fazemos um loop para LER todos os documentos e preparar as atualizações.
            for (const itemPedido of items) {
                const itemId = itemPedido.id;
                const quantidade = parseFloat(itemPedido.qty || itemPedido.quantity || 1) || 0;

                if (!itemId || quantidade <= 0) continue;

                const itemRef = doc(db, "empresas", userId, "inventario", itemId);
                const itemDoc = await transaction.get(itemRef); // <-- LEITURA

                if (!itemDoc.exists()) {
                    // Se um item não existe, a transação inteira deve falhar para garantir a integridade.
                    throw new Error(`Item de inventário com ID ${itemId} não foi encontrado.`);
                }

                const data = itemDoc.data();
                const currentQtd = parseFloat(data.quantity) || 0;

                const changeAmount = quantidade * multiplier;
                const newQtd = currentQtd + changeAmount;

                // Validação de estoque
                if (multiplier === -1 && newQtd < 0) {
                    throw new Error(`Estoque insuficiente para o item: ${data.component || itemId}. (Necessário: ${quantidade}, Disponível: ${currentQtd})`);
                }

                // Guarda a referência e os novos dados para a etapa de escrita.
                updatesToPerform.push({
                    ref: itemRef,
                    data: {
                        quantity: String(newQtd), // Mantém a consistência do tipo de dado
                        dataUltimaAtualizacao: serverTimestamp(),
                    }
                });
            }

            // ✅ ETAPA 2: ESCRITA (WRITES)
            // Agora que todas as leituras foram concluídas, executamos todas as atualizações.
            updatesToPerform.forEach(update => {
                transaction.update(update.ref, update.data); // <-- ESCRITA
            });
        });

        console.log(`Ajuste de estoque concluído com sucesso (Multiplicador: ${multiplier}).`);
        return true;

    } catch (error) {
        // O erro que você está vendo é capturado aqui e lançado novamente para o componente que chamou.
        console.error("ERRO CRÍTICO na transação de estoque:", error);
        throw error;
    }
};
