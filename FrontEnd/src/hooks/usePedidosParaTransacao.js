// src/hooks/usePedidosParaTransacao.js (Você deve implementar/corrigir este)
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

export const usePedidosParaTransacao = () => {
    const { currentUser } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const pedidosRef = collection(db, 'pedidos');

        // QUERY BÁSICA E SEGURA: Filtra apenas pelo userId e ordena pela data
        // Se você tiver um índice em 'userId' e 'data', isso funcionará.
        const q = query(
            pedidosRef,
            where('userId', '==', currentUser.uid),
            orderBy('data', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listaPedidos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Adiciona o nome do cliente/ID formatado para o dropdown
                display: doc.data().clienteNome || `Pedido #${doc.id.substring(0, 6)}`
            }));
            setPedidos(listaPedidos);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao carregar pedidos para transação:", error);
            setLoading(false);
            // Poderia retornar um erro se necessário
        });

        return () => unsubscribe();
    }, [currentUser]);

    return { pedidos, loading };
};