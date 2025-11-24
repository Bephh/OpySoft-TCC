import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

// Este hook replica a lógica de cálculo de Receita, Custo e Lucro
// da página Relatorios.jsx, mas usa onSnapshot para tempo real.
export const useRelatorios = () => {
    const { currentUser } = useAuth();
    const [relatorioData, setRelatorioData] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        loading: true,
        erro: null,
    });

    useEffect(() => {
        if (!currentUser?.uid) {
            setRelatorioData(prev => ({ ...prev, loading: false }));
            return;
        }

        const userId = currentUser.uid;
        const pedidosRef = collection(db, "empresas", userId, "pedidos");
        
        // A lógica do Relatorios.jsx considera pedidos com status 'Entregues' ou 'Enviados'
        // Para simplificar e garantir que o cálculo seja o mesmo, vamos buscar todos e filtrar no código.
        // No entanto, para otimizar, vamos buscar apenas os que têm status que indicam conclusão.
        // Assumindo que o status de conclusão é 'Finalizado' ou 'Entregues'
        const qPedidosConcluidos = query(
            pedidosRef,
            where("status", "in", ["Finalizado", "Entregues", "Enviados"])
        );

        const unsub = onSnapshot(qPedidosConcluidos, (snapshot) => {
            let totalOrders = 0;
            let totalRevenue = 0;
            let totalCost = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                
                // Usando as mesmas chaves do Relatorios.jsx
                const total = parseFloat(data.total || data.suggestedPrice || 0); // Assumindo que 'total' ou 'suggestedPrice' é a Receita
                const costPrice = parseFloat(data.costPrice || 0);

                totalOrders++;
                totalRevenue += total;
                totalCost += costPrice;
            });

            setRelatorioData({
                totalOrders,
                totalRevenue,
                totalCost,
                totalProfit: totalRevenue - totalCost,
                loading: false,
                erro: null,
            });

        }, (error) => {
            console.error("Erro ao carregar relatórios financeiros:", error);
            setRelatorioData(prev => ({ ...prev, erro: error.message, loading: false }));
        });

        return () => unsub();
    }, [currentUser]);

    return relatorioData;
};
