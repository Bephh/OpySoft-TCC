OPYSOFT-TCC - Sistema de Gestão Empresarial (ERP)
Este projeto é um ERP construído com React/Vite (Frontend), Firebase Cloud Functions (Backend) e Firestore/Firebase Auth.

1. Pré-requisitos
Certifique-se de ter instalado:

Node.js e npm (versão recomendada: 18 ou 20)

Firebase CLI (instale globalmente se necessário: npm install -g firebase-tools)

2. Configuração Inicial do Firebase
Execute estes comandos na pasta raiz do projeto:

A. Login e Vinculação
Faça login no Firebase e vincule o projeto ao ID opysoft:

Bash

firebase login
firebase use --add opysoft
3. Instalação de Dependências
Instale as dependências separadamente para o Backend (Functions) e o Frontend (React/Vite).

A. Backend (Functions)
Bash

cd FrontEnd/Functions
npm install
cd ../.. # Voltar para a pasta raiz
B. Frontend (React/Vite)
Bash

cd FrontEnd
npm install
cd .. # Voltar para a pasta raiz
4. Execução do Projeto (Ambiente Local)
Execute o Backend (Emuladores) e o Frontend (Vite) em dois terminais separados a partir da pasta raiz:

Terminal 1: Iniciar os Emuladores (Backend)
Inicia as Functions, Firestore e Authentication para desenvolvimento local.

Bash

firebase emulators:start
Verificação: O terminal mostrará os URLs para as funções e serviços locais.

Terminal 2: Iniciar o Frontend (Vite/React)
Inicia o servidor de desenvolvimento do React.

Bash

cd FrontEnd
npm run dev
O frontend abrirá no seu navegador (geralmente em http://localhost:5173), conectado aos emuladores do Terminal 1 através do proxy configurado no vite.config.js.
