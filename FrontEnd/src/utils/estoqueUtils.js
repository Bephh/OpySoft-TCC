import { db } from '../firebase-config';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

/**
 * Atualiza o estoque para cada item de um pedido (incrementa ou decrementa).
 * @param {Array} items - Lista de itens do pedido (deve ter itemId/id e qtd).
 * @param {string} userId - UID do usuário logado.
 * @param {number} multiplier - -1 para descontar (Entregue), 1 para estornar (Cancelado/Deletado).
 */
export const updateEstoqueFromPedido = async (items, userId, multiplier) => {
    if (!items || items.length === 0) return;

    const batch = writeBatch(db);

    for (const itemPedido of items) {
        const itemId = itemPedido.itemId || itemPedido.id;
        const quantidade = parseFloat(itemPedido.qtd) || 0;

        if (!itemId || quantidade <= 0) continue;

        // Caminho do item no Inventário: inventario/{userId}/itens/{itemId}
        const itemRef = doc(db, "inventario", userId, "itens", itemId);
        const changeAmount = quantidade * multiplier;

        // Lê o estado atual do item
        const itemDoc = await getDoc(itemRef);
        if (itemDoc.exists()) {
            const currentQtd = itemDoc.data().qtdAtual || 0;
            const newQtd = currentQtd + changeAmount;
            const estoqueMinimo = itemDoc.data().estoqueMinimo || 5;

            // Define o novo status do estoque
            let newStatus = 'Em Estoque';
            if (newQtd <= 1) {
                newStatus = 'Estoque Crítico';
            } else if (newQtd <= estoqueMinimo) {
                newStatus = 'Estoque Baixo';
            }

            batch.update(itemRef, {
                qtdAtual: newQtd,
                status: newStatus,
                dataUltimaAtualizacao: new Date(),
            });
        }
    }

    await batch.commit();
};