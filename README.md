# 📂 OPYSOFT-TCC - Sistema de Gestão Empresarial (ERP)

Este projeto é um sistema de gestão empresarial (ERP) construído com React/Vite no Frontend e Firebase Cloud Functions (Node.js/Express) no Backend, utilizando Firestore e Firebase Authentication para armazenamento de dados e autenticação.

## 1. Pré-requisitos

Certifique-se de que você tem instalado em sua máquina:

* **Node.js e npm** (versão recomendada: 18 ou 20. O projeto está configurado para usar a versão 22.)
* **Firebase CLI (Command Line Interface)**. Se não tiver, instale globalmente:
    ```bash
    npm install -g firebase-tools
    ```

## 2. Configuração Inicial do Firebase

Execute estes comandos a partir da **pasta raiz do projeto (`OPYSOFT-TCC`)**:

### A. Login no Firebase

Faça login na sua conta do Firebase:
```bash
firebase login
B. Vinculação ao Projeto
Vincule o repositório ao seu projeto no Firebase. (O ID do seu projeto é opysoft):

Bash

firebase use --add opysoft
3. Instalação de Dependências (Estrutura Unificada)
O projeto possui dependências separadas para o Frontend e o Backend, ambas aninhadas dentro do diretório FrontEnd.

A. Backend (Functions)
Vá para a pasta Functions (que está dentro de FrontEnd) e instale as dependências do servidor:

Bash

cd FrontEnd/Functions
npm install
cd ../.. # Voltar para a pasta raiz (OPYSOFT-TCC)
B. Frontend (React/Vite)
Vá para a pasta FrontEnd e instale as dependências do cliente:

Bash

cd FrontEnd
npm install
cd .. # Voltar para a pasta raiz (OPYSOFT-TCC)
4. Execução do Projeto (Ambiente Local)
Execute os emuladores do Firebase e o servidor de desenvolvimento do Vite simultaneamente em dois terminais diferentes, a partir da pasta raiz (OPYSOFT-TCC):

Terminal 1: Iniciar os Emuladores (Backend)
Este comando inicia as Functions, o Firestore e o Authentication, apontando para os serviços locais.

⚠️ Importante: O comando assume que o seu firebase.json na raiz contém a configuração "functions": { "source": "FrontEnd/Functions" }.

Bash

firebase emulators:start --only functions
Verificação: Após a inicialização, o terminal deve mostrar que a função api está inicializada em http://127.0.0.1:5001/opysoft/us-central1/api.

Terminal 2: Iniciar o Frontend (Vite/React)
Vá para a pasta do frontend e inicie o servidor de desenvolvimento:

Bash

cd FrontEnd
npm run dev
O frontend será aberto (geralmente em http://localhost:5173). Graças à configuração do proxy em vite.config.js, todas as chamadas axios.post('/api/register', ...) do frontend serão encaminhadas corretamente para o emulador do seu backend.

5. Build e Deploy (Produção)
Quando o projeto estiver pronto para ser publicado no Firebase Hosting:

A. Build do Frontend
Vá para a pasta FrontEnd e gere os arquivos estáticos de produção:

Bash

cd FrontEnd
npm run build
cd .. # Voltar para a pasta raiz
Resultado: Esta etapa criará a pasta FrontEnd/dist (ou o nome configurado no seu firebase.json), contendo o seu site estático.

B. Deploy Completo
Execute o deploy de Functions, Hosting, Auth e Firestore Rules a partir da pasta raiz:

Bash

firebase deploy