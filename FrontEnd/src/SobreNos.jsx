// src/pages/SobreNos.jsx

import React from "react";

export default function SobreNos() {
  const membros = [
    {
      nome: "Nicolas Galvão Bonfante",
      foto: "/nicolas.jpg", // Coloque suas imagens em public/membros/
    },
    {
      nome: "Arthur Goes Francelino",
      foto: "/arthur.jpg",
    },
    {
      nome: "Gustavo Santos Pafume",
      foto: "/gustavo.jpg",
    },
    {
      nome: "Guilherme Pereira",
      foto: "/Guilherme.jpg",
    },
    {
      nome: "Caio Drumond",
      foto: "/caio.jpg",
    }
  ];

  return (
    <div className="bg-gray-900 text-gray-100 font-sans min-h-screen pt-24 px-0 md:px-6 pb-20">
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

        <div className="md:hidden">
          <button className="text-white">☰</button>
        </div>
      </header>

      {/* Título */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Nossa Equipe</h1>
        <div className="h-1 w-24 bg-sky-700 mt-2 mx-auto"></div>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Conheça as pessoas por trás do projeto OpySoft. Cada um contribuiu com dedicação e talento para tornar este ERP uma realidade.
        </p>
      </section>

      {/* Galeria de Membros */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 px-4 sm:px-6 max-w-7xl mx-auto">
        {membros.map((membro, index) => (
          <div key={index} className="text-center">
            <div className="relative w-full aspect-[3/4] rounded-lg shadow-lg bg-[#0b1220] border border-cyan-500/50 overflow-hidden">
              <img
                src={membro.foto}
                alt={membro.nome}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold text-white mt-3">{membro.nome}</p>
          </div>
        ))}
      </section>


      {/* Footer */}
      <footer id="contato" className="fixed bottom-0 w-full bg-[#0b1220] border-t border-gray-800">
        <div className="max-w-7xl mx-auto p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} OpySoft. Todos os direitos reservados.</p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="/Termos" className="hover:text-blue-400 transition">
              Termos de Serviço
            </a>
            <a href="/Privacidade" className="hover:text-blue-400 transition">
              Política de Privacidade
            </a>
            <a href="/Contato" className="hover:text-blue-400 transition">
              Contato
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
