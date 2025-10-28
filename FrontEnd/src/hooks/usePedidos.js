import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../AuthContext'; 

// =================================================================
// FUNÇÕES DE ESTOQUE (UTILITY - Requer Permissão na Regra do Firestore)
// =================================================================
const updateEstoqueFromPedido = async (itens, userId, multiplicador) => {
    if (!itens || itens.length === 0) return;

    const batch = writeBatch(db);

    for (const itemPedido of itens) {
        const itemId = itemPedido.itemId || itemPedido.id;
        const quantidade = parseFloat(itemPedido.qtd) || 0;
        
        if (!itemId || quantidade <= 0) continue;

        // Caminho do item no Inventário: inventario/{userId}/itens/{itemId}
        const itemRef = doc(db, "inventario", userId, "itens", itemId); 
        const changeAmount = quantidade * multiplicador; 

        // Lê o estado atual do item
        const itemDoc = await getDoc(itemRef);
        if (itemDoc.exists()) {
            const currentQtd = itemDoc.data().qtdAtual || 0;
            const newQtd = currentQtd + changeAmount;
            const estoqueMinimo = itemDoc.data().estoqueMinimo || 5;

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

// =================================================================
// HOOK PRINCIPAL
// =================================================================
export const usePedidos = () => {
    const { currentUser } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            setPedidos([]);
            return;
        }

        const pedidosRef = collection(db, "pedidos");
        const q = query(
            pedidosRef,
            where("userId", "==", currentUser.uid),
            orderBy("dataCriacao", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listaPedidos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPedidos(listaPedidos);
            setLoading(false);
            setErro(null); 
        }, (error) => {
            console.error("Erro ao carregar pedidos:", error);
            setErro(error.message || "Falha ao carregar pedidos.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);
    
    // -----------------------------------------------------------------
    // LÓGICA DE MUDANÇA DE STATUS (Desconta/Estorna Estoque)
    // -----------------------------------------------------------------
    const alterarStatusPedido = async (pedidoId, novoStatus) => {
        if (!currentUser) throw new Error("Usuário não autenticado.");
        const userId = currentUser.uid;
        const pedidoRef = doc(db, "pedidos", pedidoId);

        try {
            const pedidoSnap = await getDoc(pedidoRef);
            if (!pedidoSnap.exists()) throw new Error("Pedido não encontrado.");
            const pedido = pedidoSnap.data();
            const itensPedido = pedido.itens || []; 
            const statusAnterior = pedido.status;
            
            // 1. Atualiza o status do Pedido
            await updateDoc(pedidoRef, { status: novoStatus });

            // 2. Lógica de Estoque: Desconta se for CONCLUÍDO (Entregues)
            if ((novoStatus === 'Entregues' || novoStatus === 'Enviados') && statusAnterior !== 'Entregues' && statusAnterior !== 'Enviados') {
                // Multiplicador = -1 (decrementa/desconta estoque)
                await updateEstoqueFromPedido(itensPedido, userId, -1);
            } 
            // 3. Lógica de Estoque: Estorna se for CANCELADO (e não era Cancelado antes)
            else if (novoStatus === 'Cancelado' && statusAnterior !== 'Cancelado') {
                 // Multiplicador = 1 (incrementa/estorna estoque)
                await updateEstoqueFromPedido(itensPedido, userId, 1);
            }
        } catch (error) {
            console.error("Erro ao alterar status/estoque:", error);
            throw new Error("Falha ao alterar o status do pedido e/ou estoque: " + error.message);
        }
    };
    
    // -----------------------------------------------------------------
    // LÓGICA DE DELETAR PEDIDO (Estorna Estoque)
    // -----------------------------------------------------------------
    const deletarPedido = async (pedidoId) => {
        if (!currentUser) throw new Error("Usuário não autenticado.");
        const userId = currentUser.uid;
        const pedidoRef = doc(db, "pedidos", pedidoId);

        try {
            const pedidoSnap = await getDoc(pedidoRef);
            if (pedidoSnap.exists()) {
                const pedido = pedidoSnap.data();
                const itensPedido = pedido.itens || [];

                // Se o pedido NÃO estava 'Entregue', assumimos que o estoque precisa ser estornado.
                if (pedido.status !== 'Entregues' && pedido.status !== 'Enviados') {
                    // Multiplicador = 1 (incrementa/estorna estoque)
                    await updateEstoqueFromPedido(itensPedido, userId, 1);
                }
            }

            await deleteDoc(pedidoRef);

        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            throw new Error("Falha ao deletar o pedido e/ou estornar o estoque: " + error.message);
        }
    };

    return { pedidos, loading, erro, alterarStatusPedido, deletarPedido };
};