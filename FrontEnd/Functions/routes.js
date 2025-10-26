// functions/routes.js

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();
const { getAuth } = require("firebase-admin/auth");

const ITEM_COLLECTION = "itens";
const USER_PROFILE_COLLECTION = "users";
const EMPRESA_COLLECTION = "empresas"; 

// --------------------------------------------------------------------
// 1. ROTA DE CADASTRO (POST /api/register)
// --------------------------------------------------------------------
router.post("/register", async (req, res) => {
    const data = req.body;
    if (!data.email || !data.password || !data.cnpj) {
        return res.status(400).send({ error: "Dados obrigatórios faltando." });
    }
    let user_id = null;

    try {
        // 1. Criação no Firebase Auth
        const userRecord = await getAuth().createUser({
            email: data.email,
            password: data.password,
            emailVerified: false,
        });
        user_id = userRecord.uid; 
        
        // 2. Salvando no Firestore
        
        const user_data = {
            uid: user_id,
            email: data.email,
            nome_empresa: data.nome_empresa, 
            criado_em: admin.firestore.FieldValue.serverTimestamp(),
        };

        const empresa_data = {
            uid: user_id,
            nome_empresa: data.nome_empresa,
            cnpj: data.cnpj,
            razao_social: data.razao_social,
            email_contato: data.email,
            telefone: data.telefone || "",
            data_cadastro: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        await db.collection(USER_PROFILE_COLLECTION).doc(user_id).set(user_data);
        await db.collection(EMPRESA_COLLECTION).doc(user_id).set(empresa_data);


        return res
            .status(201)
            .send({ message: "Usuário e Perfil criados com sucesso!", uid: user_id });
    } catch (error) {
        console.error("Erro no cadastro:", error.code, error.message);
        if (error.code === "auth/email-already-exists") {
            return res.status(400).send({ error: "Este e-mail já está em uso." });
        } 
        return res
            .status(500)
            .send({ error: "Erro interno ao salvar dados." });
    }
});


// --------------------------------------------------------------------
// 2. ROTA DE PERFIL (GET /api/profile)
// --------------------------------------------------------------------

router.get("/profile", async (req, res) => {
    // O uid é injetado pelo middleware 'isAuthenticated'
    const uid = req.user.uid; 

    try {
        // Busca os dados no Firestore (simultaneamente)
        const [empresaDoc, userDoc] = await Promise.all([
            db.collection(EMPRESA_COLLECTION).doc(uid).get(),
            db.collection(USER_PROFILE_COLLECTION).doc(uid).get(),
        ]);

        if (!empresaDoc.exists && !userDoc.exists) {
            return res.status(404).send({ error: "Dados de perfil da empresa não encontrados." });
        }

        return res.status(200).send({
            message: "Autenticação bem-sucedida.",
            // Combina os dados
            profile: {
                ...(userDoc.exists ? userDoc.data() : {}),
                ...(empresaDoc.exists ? empresaDoc.data() : {})
            }
        });

    } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        return res.status(500).send({ error: "Erro interno ao carregar o perfil." });
    }
});


// --------------------------------------------------------------------
// 3. ROTA PROTEGIDA DE DADOS (POST /api/itens)
// --------------------------------------------------------------------

router.post("/itens", async (req, res) => {
    const user_id = req.user.uid;
    const itemData = req.body;
    if (!itemData.nome) {
        return res.status(400).send({ error: "O campo 'nome' é obrigatório." });
    }

    const novoItem = {
        user_id: user_id,
        nome: itemData.nome,
        descricao: itemData.descricao || null,
        criado_em: admin.firestore.FieldValue.serverTimestamp(),
    };
    try {
        const docRef = await db.collection(ITEM_COLLECTION).add(novoItem);
        return res.status(201).send({
            message: "Item criado com sucesso!",
            id: docRef.id,
            ...novoItem,
        });
    } catch (error) {
        console.error("Erro ao criar item:", error);
        return res.status(500).send({ error: "Falha ao salvar o novo item." });
    }
});

module.exports = router;