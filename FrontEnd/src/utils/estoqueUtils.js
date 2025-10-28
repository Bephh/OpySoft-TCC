import { db } from '../firebase-config';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

/**
 * @param {Array} items 
 * @param {string} userId 
 * @param {number} multiplier 
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