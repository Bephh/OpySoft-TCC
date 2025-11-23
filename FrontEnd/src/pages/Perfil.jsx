import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { User, Mail, Save, AlertTriangle, Wrench, Package, ShoppingCart, Settings, DollarSign, Layers, Briefcase, BarChart, Home } from 'lucide-react';

export default function Perfil() {
    const { currentUser, userData, updateProfileData } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [appIcon, setAppIcon] = useState('');
    const [email, setEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser && userData) {
            setDisplayName(userData.nome_empresa || currentUser.displayName || '');
            setEmail(currentUser.email || '');
            setAppIcon(userData.app_icon || 'Wrench');
        }
    }, [currentUser, userData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setError("Usuário não autenticado.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const updates = {};
            if (userData?.nome_empresa !== displayName) {
                updates.nome_empresa = displayName;
                updates.displayName = displayName; // Atualiza o displayName no Auth também
            }
            if (userData?.app_icon !== appIcon) {
                updates.app_icon = appIcon;
            }

            if (Object.keys(updates).length > 0) {
                await updateProfileData(updates);
            }

            setSuccess('Perfil atualizado com sucesso!');

        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            setError('Falha ao atualizar o perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-blue-400 mb-8">Configurações de Perfil</h1>

            {error && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2 mb-4">
                    <Save size={20} />
                    <span>{success}</span>
                </div>
            )}

            <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 mb-4">
                        <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-4xl font-bold border-4 border-blue-500 text-white">
                            {displayName ? displayName[0].toUpperCase() : <User size={40} />}
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-white">{displayName || 'Nome de Usuário'}</h2>
                    <p className="text-gray-400">{email}</p>
                </div>

                <h2 className="text-xl font-bold text-blue-400 mb-4 border-t border-gray-700 pt-6">Customização da Aplicação</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">Nome de Exibição / Nome da Empresa</label>
                        <div className="flex items-center bg-gray-700 rounded-lg p-3">
                            <User size={20} className="text-gray-400 mr-3" />
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="bg-transparent text-white w-full focus:outline-none"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="appIcon" className="block text-sm font-medium text-gray-300 mb-1">Ícone da Aplicação</label>
                        <div className="flex items-center bg-gray-700 rounded-lg p-3">
                            <select
                                id="appIcon"
                                value={appIcon}
                                onChange={(e) => setAppIcon(e.target.value)}
                                className="bg-transparent text-white w-full focus:outline-none"
                                disabled={loading}
                                // CORREÇÃO: Adicionar classes para garantir que o texto do dropdown seja visível
                                style={{ backgroundColor: '#4b5563', color: 'white' }} // Fundo cinza escuro para o dropdown
                            >
                                <option value="Wrench" style={{ backgroundColor: '#4b5563', color: 'white' }}>Chave de Boca (Padrão)</option>
                                <option value="Home" style={{ backgroundColor: '#4b5563', color: 'white' }}>Casa (Painel)</option>
                                <option value="Package" style={{ backgroundColor: '#4b5563', color: 'white' }}>Pacote (Inventário)</option>
                                <option value="ShoppingCart" style={{ backgroundColor: '#4b5563', color: 'white' }}>Carrinho (Pedidos)</option>
                                <option value="Settings" style={{ backgroundColor: '#4b5563', color: 'white' }}>Engrenagem (Montador)</option>
                                <option value="Briefcase" style={{ backgroundColor: '#4b5563', color: 'white' }}>Maleta (PCs Montados)</option>
                                <option value="DollarSign" style={{ backgroundColor: '#4b5563', color: 'white' }}>Cifrão (Finanças)</option>
                                <option value="Layers" style={{ backgroundColor: '#4b5563', color: 'white' }}>Camadas (Planos)</option>
                                <option value="BarChart" style={{ backgroundColor: '#4b5563', color: 'white' }}>Gráfico de Barras (Relatórios)</option>
                                <option value="User" style={{ backgroundColor: '#4b5563', color: 'white' }}>Usuário (Perfil)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email (Não Editável)</label>
                        <div className="flex items-center bg-gray-700 rounded-lg p-3 opacity-70">
                            <Mail size={20} className="text-gray-400 mr-3" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                className="bg-transparent text-gray-400 w-full focus:outline-none"
                                disabled
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <Save size={20} /> Salvar Alterações
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}