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
	        osEmAberto: 0,
	        osTotal: 0,
	        ultimas5OS: [],
	        totalClientes: 0,
	        clientesRecorrentes: 0,
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
	            where("userId", "==", userId)
	            // Removido o filtro where("tipo", "==", "Receita") para calcular Lucro
	        );
	
		        promises.push(new Promise((resolve, reject) => {
		            const unsubTransacoes = onSnapshot(qTransacoes, (snapshot) => {
		                let receitaTotal = 0;
		                let despesaTotal = 0;
		                const receitaPorMes = Array(12).fill(0);
		                const despesaPorMes = Array(12).fill(0);
		
		                snapshot.forEach((doc) => {
		                    const data = doc.data();
		                    const valor = parseFloat(data.valor) || 0;
		                    const tipo = data.tipo;
		
		                    if (tipo === 'Receita') {
		                        receitaTotal += valor;
		                    } else if (tipo === 'Despesa') {
		                        despesaTotal += valor;
		                    }
		
		                    // Calcula Receita e Despesa por Mês
		                    if (data.data && typeof data.data.toDate === 'function') {
		                        try {
		                            const dataTransacao = data.data.toDate();
		                            if (dataTransacao.getFullYear() === anoAtual) {
		                                const mes = dataTransacao.getMonth();
		                                if (tipo === 'Receita') {
		                                    receitaPorMes[mes] += valor;
		                                } else if (tipo === 'Despesa') {
		                                    despesaPorMes[mes] += valor;
		                                }
		                            }
		                        } catch (e) { /* Ignora data inválida */ }
		                    }
		                });
		
		                const lucroTotal = receitaTotal - despesaTotal;
		                const lucroPorMes = receitaPorMes.map((r, i) => r - despesaPorMes[i]);
		
		                resolve({ receitaTotal, despesaTotal, lucroTotal, receitaPorMes: lucroPorMes });
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
	
	        // 3. DADOS DE ORDENS DE SERVIÇO (NOVO)
	        const osRef = collection(db, "empresas", userId, "ordens_servico");
	        const qOS = query(osRef);
	
	        promises.push(new Promise((resolve, reject) => {
	            const unsubOS = onSnapshot(qOS, (snapshot) => {
	                let osEmAberto = 0;
	                let osTotal = 0;
	                const ultimasOS = [];
	
	                snapshot.forEach((doc) => {
	                    const data = doc.data();
	                    osTotal++;
	
	                    // Contagem de OS em Aberto (Status diferente de Finalizado)
	                    if (data.status !== 'Finalizado') {
	                        osEmAberto++;
	                    }
	
	                    // Coleta as últimas 5 OS
	                    ultimasOS.push({ id: doc.id, ...data });
	                });
	
	                // Ordena e pega as 5 mais recentes (assumindo que o Firestore retorna em ordem ou que a data de criação será usada na ordenação)
	                // Para simplificar, vamos apenas pegar as 5 primeiras do snapshot, mas o ideal seria ordenar por dataCriacao.
	                ultimasOS.sort((a, b) => (b.dataCriacao?.toDate() || 0) - (a.dataCriacao?.toDate() || 0));
	                const ultimas5OS = ultimasOS.slice(0, 5);
	
	                resolve({ osEmAberto, osTotal, ultimas5OS });
	            }, reject);
	            disposers.push(unsubOS);
	        }));
	
	        // 4. DADOS DE CLIENTES (NOVO)
	        const clientesRef = collection(db, "empresas", userId, "clientes");
	        const qClientes = query(clientesRef);
	
	        promises.push(new Promise((resolve, reject) => {
	            const unsubClientes = onSnapshot(qClientes, (snapshot) => {
	                let totalClientes = 0;
	                let clientesRecorrentes = 0;
	
	                snapshot.forEach((doc) => {
	                    const data = doc.data();
	                    totalClientes++;
	
	                    if (data.recorrente) {
	                        clientesRecorrentes++;
	                    }
	                });
	
	                resolve({ totalClientes, clientesRecorrentes });
	            }, reject);
	            disposers.push(unsubClientes);
	        }));
	
	        // 5. DADOS DO INVENTÁRIO (Caminho CORRETO: empresas)

	        // 6. DADOS DO INVENTÁRIO (Caminho CORRETO: empresas)
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
	
	                // ... (lógica de cálculo de variação de lucro mantida)
		                const lucroAtual = finalData.receitaPorMes[mesAtual]; // finalData.receitaPorMes agora é lucroPorMes
		                const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
		                const lucroAnterior = finalData.receitaPorMes[mesAnterior];
		                let variacaoLucro = 0;
		
		                if (lucroAnterior > 0) {
		                    variacaoLucro = ((lucroAtual - lucroAnterior) / lucroAnterior) * 100;
		                } else if (lucroAtual > 0) {
		                    variacaoLucro = 100;
		                }
		
		                setDashboardData(prev => ({
		                    ...prev,
		                    ...finalData,
		                    variacaoReceita: variacaoLucro.toFixed(1), // Mantendo o nome da variável para não quebrar o Painel.jsx
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