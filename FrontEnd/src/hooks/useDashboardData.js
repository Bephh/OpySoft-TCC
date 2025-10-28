import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs, // CORREÇÃO: getDocs deve ser importado
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';

export const useDashboardData = () => {
    const { currentUser } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        receitaTotal: 0,
        receitaPorMes: Array(12).fill(0),
        volumePedidosPorMes: Array(12).fill(0),
        novosPedidos: 0,
        estoqueBaixo: 0,
        producaoAndamento: 0,
        loading: true,
        erro: null,
    });

    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();

    useEffect(() => {
        if (!currentUser?.uid) {
            setDashboardData(prev => ({ ...prev, loading: false }));
            return;
        }

        const userId = currentUser.uid;
        const promises = [];
        const disposers = [];

        // 1. DADOS FINANCEIROS (COLEÇÃO RAIZ TRANSACOES)
        const transacoesRef = collection(db, "transacoes");
        const qTransacoes = query(
            transacoesRef,
            where("userId", "==", userId),
            where("tipo", "==", "Receita")
        );

        promises.push(new Promise((resolve, reject) => {
            const unsubTransacoes = onSnapshot(qTransacoes, (snapshot) => {
                let receitaTotal = 0;
                const receitaPorMes = Array(12).fill(0);

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const valor = parseFloat(data.valor) || 0;

                    receitaTotal += valor;

                    // Calcula Receita por Mês
                    if (data.data && typeof data.data.toDate === 'function') {
                        try {
                            const dataTransacao = data.data.toDate();
                            if (dataTransacao.getFullYear() === anoAtual) {
                                const mes = dataTransacao.getMonth();
                                receitaPorMes[mes] += valor;
                            }
                        } catch (e) { /* Ignora data inválida */ }
                    }
                });

                resolve({ receitaTotal, receitaPorMes });
            }, reject);
            disposers.push(unsubTransacoes);
        }));

        // 2. DADOS DE PEDIDOS (Caminho CORRETO: empresas)
        const pedidosRef = collection(db, "empresas", userId, "pedidos");
        const qPedidos = query(pedidosRef);

        promises.push(new Promise((resolve, reject) => {
            const unsubPedidos = onSnapshot(qPedidos, (snapshot) => {
                let novosPedidos = 0;
                const volumePedidosPorMes = Array(12).fill(0);

                snapshot.forEach((doc) => {
                    const data = doc.data();

                    // Contagem de Novos Pedidos
                    if (data.status === 'Processando' || data.status === 'Pendente') {
                        novosPedidos++;
                    }

                    // Contagem de Volume por Mês
                    if (data.dataCriacao && typeof data.dataCriacao.toDate === 'function') {
                        try {
                            const dataPedido = data.dataCriacao.toDate();
                            if (dataPedido.getFullYear() === anoAtual) {
                                const mes = dataPedido.getMonth();
                                volumePedidosPorMes[mes] += 1;
                            }
                        } catch (e) { /* Ignora data inválida */ }
                    }
                });

                resolve({ novosPedidos, volumePedidosPorMes });
            }, reject);
            disposers.push(unsubPedidos);
        }));

        // 3. DADOS DO INVENTÁRIO (Caminho CORRETO: empresas)
        promises.push(getDocs(collection(db, "empresas", userId, "inventario"))
            .then(snapshot => {
                let estoqueBaixo = 0;
                let producaoAndamento = 0;

                snapshot.forEach(doc => {
                    const item = doc.data();
                    const qtdAtual = parseFloat(item.quantity) || 0;
                    const estoqueMinimo = parseFloat(item.minStock) || 5;

                    if (qtdAtual <= estoqueMinimo) {
                        estoqueBaixo++;
                    }
                });
                return { estoqueBaixo, producaoAndamento };
            })
            .catch(e => {
                console.error("Erro ao buscar inventário:", e);
                return { estoqueBaixo: 0, producaoAndamento: 0 };
            })
        );

        // FINALIZAÇÃO
        Promise.all(promises)
            .then(results => {
                const finalData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

                // ... (lógica de cálculo de variação de receita mantida)
                const receitaAtual = finalData.receitaPorMes[mesAtual];
                const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
                const receitaAnterior = finalData.receitaPorMes[mesAnterior];
                let variacaoReceita = 0;

                if (receitaAnterior > 0) {
                    variacaoReceita = ((receitaAtual - receitaAnterior) / receitaAnterior) * 100;
                } else if (receitaAtual > 0) {
                    variacaoReceita = 100;
                }

                setDashboardData(prev => ({
                    ...prev,
                    ...finalData,
                    variacaoReceita: variacaoReceita.toFixed(1),
                    loading: false
                }));
            })
            .catch(error => {
                console.error("Erro no carregamento do Dashboard:", error);
                setDashboardData(prev => ({ ...prev, erro: error.message, loading: false }));
            });


        return () => {
            disposers.forEach(unsub => unsub());
        };
    }, [currentUser]);

    return dashboardData;
};