import React from 'react';
import { Building2, Mail, Lock, Phone, Landmark } from 'lucide-react';

export default function LoginCompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-t from-cyan-700 to-sky-950 text-white flex flex-col items-center justify-center px-4">

      {/* Header */}
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

      {/* Formulário de Cadastro de Empresa */}
      <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-2xl mt-24">
        <h2 className="text-3xl font-bold mb-6 text-center">Login da Empresa</h2>

        <form className="space-y-5">


          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email corporativo</label>
            <div className="flex items-center bg-gray-700 rounded px-3 py-2">
              <Mail className="text-cyan-500 mr-2" />
              <input
                type="email"
                placeholder="contato@empresa.com.br"
                className="bg-transparent w-full outline-none text-white"
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
                className="bg-transparent w-full outline-none text-white"
              />
            </div>
          </div>
          {/* Botão de login */}
          <button
            type="submit"
            className=" cursor-pointer w-full bg-cyan-500 hover:bg-sky-700 text-white font-semibold py-3 rounded-md shadow transition"
          >
            Login
          </button>

          {/* Link para login */}
          <p className="text-center text-sm mt-4 text-gray-400">
            Não tem uma conta? crie uma agora!!{' '}
            <a href='/register' onClick={() => navigate('/register')} className="text-cyan-500 hover:text-sky-400 underline">
            <br />
              Registre-se
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
