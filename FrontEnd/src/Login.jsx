import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase-config';

export default function LoginCompanyPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. AUTENTICAÇÃO NO FIREBASE
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. OBTÉM O TOKEN DE AUTORIZAÇÃO
            const idToken = await user.getIdToken();

            // 3. CHAMADA AO BACKEND
            const response = await axios.get('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            localStorage.setItem('firebaseIdToken', idToken);
            console.log("Login bem-sucedido! Perfil carregado:", response.data.profile);

            // Redireciona para o dashboard
            navigate('/DashBoard');

        } catch (err) {
            console.error("Erro de Login:", err);

            let errorMessage = "Falha no login. Verifique suas credenciais.";
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                errorMessage = "Email ou senha incorretos. Tente novamente.";
            } else if (err.response?.data?.error) {
                // Erro vindo do backend Node.js (ex: 404 perfil não encontrado)
                errorMessage = err.response.data.error;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetMessage('');
        setResetLoading(true);

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
            setResetEmail('');

            // Fecha o modal após 3 segundos
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetMessage('');
            }, 3000);
        } catch (err) {
            console.error("Erro ao enviar email de recuperação:", err);

            let errorMessage = "Erro ao enviar email de recuperação.";
            if (err.code === 'auth/user-not-found') {
                errorMessage = "Email não encontrado. Verifique o endereço digitado.";
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = "Email inválido. Digite um email válido.";
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
            }

            setResetError(errorMessage);
        } finally {
            setResetLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-t from-cyan-700 to-sky-950 text-white flex flex-col items-center justify-center px-4">

            <header className="absolute top-0 left-0 w-full z-20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                    <a href="/">
                        <span className="font-bold text-lg text-white">
                            Opy<span className="text-cyan-500">Soft</span>
                        </span>
                    </a>
                </div>
                <nav className="hidden md:flex gap-6 text-white">
                    <a href="/" className="hover:text-sky-700 transition">Home</a>
                    <a href="/#sobre" className="hover:text-sky-700 transition">Sobre</a>
                    <a href="/#beneficios" className="hover:text-sky-700 transition">Benefícios</a>
                    <a href="/#contato" className="hover:text-sky-700 transition">Contato</a>
                </nav>
            </header>

            {/* Formulário de Login */}
            <div className="bg-gray-800 dark:bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-2xl mt-24">
                <h2 className="text-3xl font-bold mb-6 text-center">Login da Empresa</h2>

                {error && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleLogin}>

                    {/* Email */}
                    <div>
                        <label className="block text-sm mb-1">Email corporativo</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Mail className="text-cyan-500 mr-2" />
                            <input
                                type="email"
                                placeholder="contato@empresa.com.br"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>


                    {/* Senha */}
                    <div>
                        <label className="block text-sm mb-1">Senha</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Lock className="text-cyan-500 mr-2" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Link Esqueci minha senha */}
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-cyan-500 hover:text-sky-400 text-sm underline"
                        >
                            Esqueci minha senha
                        </button>
                    </div>

                    {/* Botão de login */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full bg-cyan-500 hover:bg-sky-700 text-white font-semibold py-3 rounded-md shadow transition disabled:bg-gray-500"
                    >
                        {loading ? 'Entrando...' : 'Login'}
                    </button>

                    {/* Link para registro */}
                    <p className="text-center text-sm mt-4 text-gray-400">
                        Não tem uma conta? crie uma agora!!{' '}
                        <a
                            href='/register'
                            onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                            className="text-cyan-500 hover:text-sky-400 underline"
                        >
                            <br />
                            Registre-se
                        </a>
                    </p>
                </form>
            </div>

            {/* Modal de Recuperação de Senha */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4 text-center">Recuperar Senha</h3>

                        {resetMessage && (
                            <div className="bg-green-500 text-white p-3 rounded-md mb-4 text-center">
                                {resetMessage}
                            </div>
                        )}

                        {resetError && (
                            <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                                {resetError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Digite seu email</label>
                                <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                                    <Mail className="text-cyan-500 mr-2" />
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="bg-transparent w-full outline-none text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setResetEmail('');
                                        setResetError('');
                                        setResetMessage('');
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-md transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="flex-1 bg-cyan-500 hover:bg-sky-700 text-white font-semibold py-2 rounded-md transition disabled:bg-gray-500"
                                >
                                    {resetLoading ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}