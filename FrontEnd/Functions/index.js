// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const isAuthenticated = require("./authMiddleware"); // Importa o middleware

// Inicialização do Firebase Admin (necessário para Firestore e Auth)
admin.initializeApp();

const routes = require("./routes");

const app = express();

// --- CORS e JSON Parsing ---
// Configura as origens permitidas (localhost do Vite e produção)
const corsOptions = {
    origin: [
        "http://localhost:5173", // Dev
        "http://127.0.0.1:5173",
    ],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
// ---------------------------

// --- Roteamento e Middleware ---

// Rotas Públicas (sem autenticação)
// A rota da homepage deve ser acessada publicamente.
// Montamos o roteador aqui para que as rotas públicas fiquem acessíveis antes do middleware.
app.use("/api", routes);

// Aplica o middleware de autenticação a TODAS as rotas que começam com /api, 
// exceto as que já foram definidas e são públicas (como a /homepage).
app.use("/api", isAuthenticated);

// -------------------------------

// Exporta o aplicativo Express como a Cloud Function 'api'
exports.api = functions.https.onRequest(app);