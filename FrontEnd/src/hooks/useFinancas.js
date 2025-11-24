// eu acho que isso nao serve mais pra nada
// eu acho que isso nao serve mais pra nada
// eu acho que isso nao serve mais pra nada
// eu acho que isso nao serve mais pra nada
// eu acho que isso nao serve mais pra nada
// eu acho que isso nao serve mais pra nada
// eu acho que isso nao serve mais pra nada


import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';

// -----------------------------------------------------------------
// FUNÇÃO sei la
// -----------------------------------------------------------------
/**
 * Atualiza o campo 'total' de um pedido aninhado.
 */
const atualizarValorPedido = async (pedidoId, novoValor, userId) => {
    if (!userId || !pedidoId) {
        console.warn("AVISO: userId ou pedidoId ausente para atualização do pedido.");
        return;
    }

    const pedidoRef = doc(db, 'empresas', userId, 'pedidos', pedidoId);

    try {
        const docSnap = await getDoc(pedidoRef);

        if (!docSnap.exists()) {
            console.error(`Pedido ${pedidoId} não encontrado. Não foi possível atualizar o total.`);
            throw new Error(`O pedido ${pedidoId} não existe. Atualização abortada.`);
        }

        await updateDoc(pedidoRef, {
            total: novoValor,
            dataAtualizacao: serverTimestamp(),
        });
    } catch (e) {
        console.error("ERRO ao atualizar o valor do Pedido:", e);
        throw e;
    }
}

export const useFinancas = () => {
    const { currentUser } = useAuth();
    const [transacoes, setTransacoes] = useState([]);
    const [summary, setSummary] = useState({ receitaTotal: 0, despesaTotal: 0, lucroLiquido: 0 });
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    // Efeito para carregar transações em tempo real (mantido)
    useEffect(() => {
        if (!currentUser?.uid) {
            setLoading(false);
            setTransacoes([]);
            setSummary({ receitaTotal: 0, despesaTotal: 0, lucroLiquido: 0 });
            return;
        }

        const transacoesRef = collection(db, "transacoes");

        // Query que requer o Índice Composto: transacoes | userId Ascending | data Descending
        const q = query(
            transacoesRef,
            where("userId", "==", currentUser.uid),
            orderBy("data", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // ... (lógica de cálculo de resumo e atualização de estado mantida)
            const listaTransacoes = [];
            let receita = 0;
            let despesa = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                const valor = parseFloat(data.valor) || 0;

                if (!data.data) {
                    console.warn(`Transação ${doc.id} sem carimbo de data.`);
                    return;
                }

                listaTransacoes.push({ id: doc.id, ...data });

                if (data.tipo === 'Receita') {
                    receita += valor;
                } else if (data.tipo === 'Despesa') {
                    despesa += valor;
                }
            });

            setTransacoes(listaTransacoes);
	            setSummary({
	                receitaTotal: receita, // Faturamento Bruto
	                despesaTotal: despesa, // Custo Total + Outras Despesas
	                lucroLiquido: receita - despesa, // Lucro Líquido
	            });
            setLoading(false);
            setErro(null);
        }, (error) => {
            console.error("Erro ao carregar transações:", error);
            setErro(error.message || "Falha ao carregar dados financeiros.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // -----------------------------------------------------------------
    // FUNÇÃO DE ADIÇÃO (mantida)
    // -----------------------------------------------------------------
    const adicionarTransacao = async (data) => {
        if (!currentUser?.uid) throw new Error("Usuário não autenticado.");

        if (!data.descricao || data.valor === undefined || data.tipo === undefined) {
            throw new Error("Dados da transação (descrição, valor e tipo) são obrigatórios.");
        }

        try {
            await addDoc(collection(db, "transacoes"), {
                ...data,
                userId: currentUser.uid,
                data: serverTimestamp(),
                valor: parseFloat(data.valor) || 0
            });
        } catch (error) {
            console.error("Erro ao adicionar transação:", error);
            throw new Error(error.message || "Falha ao salvar a transação.");
        }
    };

    // -----------------------------------------------------------------
    // FUNÇÃO DE ATUALIZAÇÃO (CORRIGIDA)
    // -----------------------------------------------------------------
    const atualizarTransacao = async (id, dadosAtualizados) => {
        if (!currentUser?.uid) {
            throw new Error("Usuário não autenticado para atualizar.");
        }

        const transacaoRef = doc(db, "transacoes", id);

        const dataToUpdate = { ...dadosAtualizados };

        // CORREÇÃO: Remove campos proibidos para o update (resolve o erro 'Unsupported field value: undefined')
        delete dataToUpdate.userId;
        delete dataToUpdate.id;

        if (dataToUpdate.valor !== undefined) {
            dataToUpdate.valor = parseFloat(dataToUpdate.valor);
        }

        const transacaoOriginal = transacoes.find(t => t.id === id);

        try {
            // 1. Atualiza a transação principal
            await updateDoc(transacaoRef, dataToUpdate);

            // 2. Lógica para atualizar o Pedido, SE aplicável (e for Receita)
            const finalPedidoId = dataToUpdate.pedidoId || transacaoOriginal?.pedidoId;
            const novoValor = dataToUpdate.valor;
            const tipoTransacao = dataToUpdate.tipo || transacaoOriginal?.tipo;

            if (finalPedidoId && novoValor !== undefined && tipoTransacao === 'Receita') {
                // Chama a função auxiliar, que usa a referência correta 'empresas'
                await atualizarValorPedido(finalPedidoId, novoValor, currentUser.uid);
            }

        } catch (error) {
            console.error("Erro ao atualizar transação (e/ou pedido):", error);
            throw new Error(error.message || "Falha ao atualizar a transação.");
        }
    };

    // -----------------------------------------------------------------
    // FUNÇÃO DE DELEÇÃO (mantida)
    // -----------------------------------------------------------------
    const deletarTransacao = async (id) => {
        if (!currentUser?.uid) throw new Error("Usuário não autenticado para deletar.");

        const transacaoRef = doc(db, "transacoes", id);
        try {
            await deleteDoc(transacaoRef);
        } catch (error) {
            console.error("Erro ao deletar transação:", error);
            throw new Error(error.message || "Falha ao deletar. Verifique as Regras de Segurança.");
        }
    };


    return { transacoes, summary, loading, erro, adicionarTransacao, atualizarTransacao, deletarTransacao };
};