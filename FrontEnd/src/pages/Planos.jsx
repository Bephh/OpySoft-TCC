import React from "react";
import { Check } from "lucide-react";

export default function Planos() {
  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Planos e Preços</h1>
        <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">Escolha o plano que melhor se adapta às necessidades do seu negócio.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {/* Teste Gratuito */}
          <div className="flex flex-col justify-between rounded-xl p-4 sm:p-6 transition transform hover:shadow-lg">
            <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 sm:p-6 shadow-md ring-1 ring-green-500/30 overflow-hidden flex flex-col">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-xs sm:text-sm font-semibold text-white bg-green-600 px-2 py-1 rounded whitespace-nowrap">Teste gratuito</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">7 dias</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white line-clamp-2">Grátis — 7 dias</h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 line-clamp-2">Teste todas as funcionalidades por 7 dias sem compromisso.</p>

              <div className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-white break-words">
                Grátis <span className="text-xs sm:text-base font-medium text-gray-400 block sm:inline">/7 dias</span>
              </div>

              <ul className="text-gray-300 space-y-2 sm:space-y-3 text-xs sm:text-sm flex-1">
                <li className="flex items-start gap-2">
                  <Check className="text-green-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Acesso completo às funcionalidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Até 2 usuários durante o teste</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Suporte por email</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-md font-semibold shadow-sm cursor-pointer text-xs sm:text-base transition whitespace-nowrap overflow-hidden text-ellipsis">Iniciar teste gratuito</button>
              <button className="w-full border border-green-600 text-green-400 hover:text-green-300 py-2 sm:py-2 rounded-md hover:bg-green-600/10 cursor-pointer text-xs sm:text-base transition whitespace-nowrap overflow-hidden text-ellipsis">Mais informações</button>
            </div>
          </div>

          {/* Mensal */}
          <div className="flex flex-col justify-between rounded-xl p-4 sm:p-6 transition transform hover:shadow-lg">
            <div className="h-full bg-gradient-to-br from-blue-900/40 to-blue-950/40 rounded-xl p-4 sm:p-6 shadow-md ring-1 ring-blue-500/30 overflow-hidden flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white line-clamp-1">Mensal</h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 line-clamp-2">Ideal para indivíduos e equipes pequenas.</p>

              <div className="text-2xl sm:text-3xl font-extrabold mb-4 text-white break-words">
                R$49 <span className="text-xs sm:text-base font-medium text-gray-400 block sm:inline">/mês</span>
              </div>

              <ul className="text-gray-300 space-y-2 sm:space-y-3 text-xs sm:text-sm flex-1">
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Até 2 usuários</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Gestão de Inventário</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Gestão de Pedidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Montador de PC</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Suporte por Email</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 sm:mt-6">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-md font-semibold shadow-sm cursor-pointer text-xs sm:text-base transition whitespace-nowrap overflow-hidden text-ellipsis">Começar Agora</button>
            </div>
          </div>

          {/* Anual (destaque) */}
          <div className="flex flex-col justify-between rounded-xl p-4 sm:p-6 transition transform hover:shadow-xl sm:col-span-2 lg:col-span-1 border-2 border-cyan-500/50">
            <div className="h-full bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-xl p-4 sm:p-6 shadow-lg overflow-hidden flex flex-col">
              <div className="inline-block mb-3">
                <span className="text-xs sm:text-sm font-semibold text-white bg-cyan-600 px-3 py-1 rounded-full whitespace-nowrap">Mais Popular</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white line-clamp-1">Anual</h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 line-clamp-2">Perfeito para negócios em crescimento que precisam de mais recursos.</p>

              <div className="text-2xl sm:text-3xl font-extrabold mb-4 text-white break-words">
                R$499 <span className="text-xs sm:text-base font-medium text-gray-400 block sm:inline">/ano</span>
              </div>

              <ul className="text-gray-300 space-y-2 sm:space-y-3 text-xs sm:text-sm flex-1">
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Até 10 usuários</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Tudo do plano Mensal</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Planejamento de Produção</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Gestão de Fornecedores</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Relatórios Avançados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Suporte Prioritário</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 sm:mt-6">
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 sm:py-3 rounded-md font-semibold shadow cursor-pointer text-xs sm:text-base transition whitespace-nowrap overflow-hidden text-ellipsis">Escolher Anual</button>
            </div>
          </div>

          {/* Empresarial */}
          <div className="flex flex-col justify-between rounded-xl p-4 sm:p-6 transition transform hover:shadow-lg">
            <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-6 shadow-md ring-1 ring-slate-600/30 overflow-hidden flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white line-clamp-1">Empresarial</h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 line-clamp-2">Solução completa para grandes operações.</p>

              <div className="text-2xl sm:text-3xl font-extrabold mb-4 text-white">Customizado</div>

              <ul className="text-gray-300 space-y-2 sm:space-y-3 text-xs sm:text-sm flex-1">
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Usuários ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Tudo do plano Anual</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Análise de IA da Cadeia de Suprimentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Integrações Personalizadas (API)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">Gerente de Conta Dedicado</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 sm:py-3 rounded-md shadow-sm cursor-pointer text-xs sm:text-base transition whitespace-nowrap overflow-hidden text-ellipsis">Entre em Contato</button>
              <button className="w-full border border-cyan-600 text-cyan-400 hover:text-cyan-300 py-2 rounded-md hover:bg-cyan-600/10 cursor-pointer text-xs sm:text-base transition whitespace-nowrap overflow-hidden text-ellipsis">Solicitar demonstração</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}