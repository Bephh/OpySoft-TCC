import React, { useState, useEffect } from 'react';
import { Building2, Mail, Lock, Phone, Landmark, CheckCircle } from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { mask, unMask } from 'remask';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

let app;
let auth;
let db;

const initializeFirebase = async (setAuthReady, setUserId) => {
    try {

        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }

        auth = getAuth(app);
        db = getFirestore(app);

        window.base64ToArrayBuffer = (base64) => {
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        };

        window.pcmToWav = (pcm16, sampleRate) => {
            const numChannels = 1;
            const bytesPerSample = 2;
            const buffer = new ArrayBuffer(44 + pcm16.byteLength);
            const view = new DataView(buffer);
            let offset = 0;

            const writeString = (str) => {
                for (let i = 0; i < str.length; i++) {
                    view.setUint8(offset + i, str.charCodeAt(i));
                }
                offset += str.length;
            };

            writeString('RIFF'); offset += 4;
            view.setUint32(offset, 36 + pcm16.byteLength, true); offset += 4;
            writeString('WAVE'); offset += 4;

            writeString('fmt '); offset += 4;
            view.setUint32(offset, 16, true); offset += 4;
            view.setUint16(offset, 1, true); offset += 2;
            view.setUint16(offset, numChannels, true); offset += 2;
            view.setUint32(offset, sampleRate, true); offset += 4;
            view.setUint32(offset, sampleRate * numChannels * bytesPerSample, true); offset += 4;
            view.setUint16(offset, numChannels * bytesPerSample, true); offset += 2;
            view.setUint16(offset, bytesPerSample * 8, true); offset += 2;

            writeString('data'); offset += 4;
            view.setUint32(offset, pcm16.byteLength, true); offset += 4;

            const pcmBytes = new Uint8Array(pcm16.buffer);
            for (let i = 0; i < pcmBytes.length; i++) {
                view.setUint8(offset + i, pcmBytes[i]);
            }

            return new Blob([buffer], { type: 'audio/wav' });
        };

        // Não há tentativa de signInAnonymously/signInWithCustomToken aqui (CORREÇÃO DE auth/admin-restricted-operation)

        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
            setAuthReady(true);
        });

    } catch (e) {
        console.error("Erro na inicialização do Firebase:", e);
        setAuthReady(true);
    }
};


export default function App() {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setAuthReady] = useState(false);

    const [pageState, setPageState] = useState('register');

    const [formData, setFormData] = useState({
        nome_empresa: '',
        cnpj: '',
        razao_social: '',
        email: '',
        telefone: '',
        password: '',
        confirmPassword: '',
    });

    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);

    useEffect(() => {
        initializeFirebase(setAuthReady, setUserId);
    }, []);

    const handleCnpjChange = (e) => {
        const onlyNumbers = unMask(e.target.value);
        const masked = mask(onlyNumbers, ['99.999.999/9999-99']);

        setFormData(prevData => ({ ...prevData, cnpj: masked }));
        setMessage(null); setMessageType(null);
    };

    const handleTelefoneChange = (e) => {
        const onlyNumbers = unMask(e.target.value);
        const masked = mask(onlyNumbers, ['(99) 9999-9999', '(99) 99999-9999']);

        setFormData(prevData => ({ ...prevData, telefone: masked }));
        setMessage(null); setMessageType(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage(null); setMessageType(null);
    };

    const handleTermsToggle = () => {
        setIsTermsAccepted(!isTermsAccepted);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthReady) {
            setMessage("Aguarde a inicialização do sistema.");
            setMessageType('error');
            return;
        }

        if (!isTermsAccepted) {
            setMessage("Você deve aceitar os Termos de Serviço para continuar.");
            setMessageType('error');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage("As senhas não coincidem.");
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage(null);
        setMessageType(null);

        try {
            // 1. CRIAÇÃO DE USUÁRIO (FIREBASE AUTH)
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const uid = userCredential.user.uid;

            const cnpj_unmasked_sanitized = unMask(formData.cnpj).replace(/\D/g, '');
            const telefone_unmasked_sanitized = unMask(formData.telefone).replace(/\D/g, '');

            // 2. SALVAR DADOS DA EMPRESA (FIRESTORE) - CORREÇÃO DE CAMINHO PARA 'empresas/{uid}'
            const empresaRef = doc(db, 'empresas', uid);

            await setDoc(empresaRef, {
                uid: uid,
                nome_empresa: formData.nome_empresa,
                cnpj: cnpj_unmasked_sanitized,
                razao_social: formData.razao_social,
                email_contato: formData.email,
                telefone: telefone_unmasked_sanitized,
                data_cadastro: serverTimestamp(),
            });

            console.log("Cadastro bem-sucedido. UID:", uid);
            setMessage("Cadastro realizado com sucesso! Você pode ir para o login.");
            setMessageType('success');
            setPageState('success');


        } catch (error) {
            let errorMessage = "Erro desconhecido durante o cadastro.";

            if (error.code && error.code.startsWith('auth/')) {
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = "Este email já está cadastrado. Tente fazer login.";
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = "O formato do email é inválido.";
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = "A senha deve ter pelo menos 6 caracteres.";
                }
            } else if (error.code && error.code === 'permission-denied') {
                errorMessage = "Erro de permissão no servidor. Verifique as Regras de Segurança do Firestore.";
            } else {
                errorMessage = `Erro: ${error.message}`;
            }

            console.error("Erro no registro:", error);
            setMessage(errorMessage);
            setMessageType('error');

        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = isLoading || !isTermsAccepted || !isAuthReady;


    const MessageDisplay = ({ message, type }) => {
        if (!message) return null;
        const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
        return (
            <div className={`${bgColor} text-white p-3 rounded-md mb-4 text-center transition-opacity duration-300`}>
                {message}
            </div>
        );
    };

    // Renderização da Tela de Sucesso
    if (pageState === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-t from-cyan-700 to-sky-950 text-white flex flex-col items-center justify-center px-4">
                <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                    <CheckCircle className="text-cyan-500 w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-4">Cadastro Concluído!</h2>
                    <p className="text-gray-300 mb-6">
                        Sua empresa foi cadastrada com sucesso. Agora você pode fazer o login para acessar o sistema.
                    </p>
                    {/* CORREÇÃO DE NAVEGAÇÃO: Remove onClick para ir para /login */}
                    <a
                        href='/login'
                        className="w-full inline-block bg-cyan-500 hover:bg-sky-700 text-white font-semibold py-3 rounded-md shadow transition"
                    >
                        Ir para o Login
                    </a>
                </div>
            </div>
        );
    }

    // Renderização do Formulário de Registro
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

            <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-2xl mt-24">
                <h2 className="text-3xl font-bold mb-6 text-center">Cadastro da Empresa</h2>

                <MessageDisplay message={message} type={messageType} />

                <form className="space-y-5" onSubmit={handleSubmit}>

                    <div>
                        <label className="block text-sm mb-1">Nome da empresa</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Building2 className="text-cyan-500 mr-2" />
                            <input
                                type="text"
                                name="nome_empresa"
                                value={formData.nome_empresa}
                                onChange={handleChange}
                                placeholder="Ex: TechHardware"
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">CNPJ</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Landmark className="text-cyan-500 mr-2" />
                            <input
                                type="text"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleCnpjChange}
                                placeholder="00.000.000/0001-00"
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Razão Social</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Building2 className="text-cyan-500 mr-2" />
                            <input
                                type="text"
                                name="razao_social"
                                value={formData.razao_social}
                                onChange={handleChange}
                                placeholder="Nome jurídico da empresa"
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Email corporativo</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Mail className="text-cyan-500 mr-2" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="contato@empresa.com.br"
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Telefone</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Phone className="text-cyan-500 mr-2" />
                            <input
                                type="tel"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleTelefoneChange}
                                placeholder="(11) 91234-5678"
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Senha</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Lock className="text-cyan-500 mr-2" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Confirmar senha</label>
                        <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                            <Lock className="text-cyan-500 mr-2" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="bg-transparent w-full outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="termsAcceptance"
                            checked={isTermsAccepted}
                            onChange={handleTermsToggle}
                            className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-300 rounded"
                        />
                        <label htmlFor="termsAcceptance" className="text-sm text-gray-300">
                            Eu li e concordo com os{' '}
                            <a href="/Termos" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-sky-400 underline font-medium">
                                Termos de Serviço
                            </a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={`cursor-pointer w-full text-white font-semibold py-3 rounded-md shadow transition 
                            ${isButtonDisabled
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-cyan-500 hover:bg-sky-700'
                            }`}
                    >
                        {isLoading ? 'Cadastrando...' : 'Cadastrar Empresa'}
                    </button>

                    <p className="text-center text-sm mt-4 text-gray-400">
                        Já tem uma conta?{' '}
                        {/* CORREÇÃO DE NAVEGAÇÃO: Remove onClick para ir para /login */}
                        <a
                            href='/login'
                            className="text-cyan-500 hover:text-sky-400 underline">
                            <br />
                            Faça login
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}