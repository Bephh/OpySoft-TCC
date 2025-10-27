// functions/authMiddleware.js

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

// Middleware para validar o ID Token
const isAuthenticated = async (req, res, next) => {
    
    // EXCEÇÃO: Permite que a rota de registro prossiga sem autenticação
    if (req.path === '/register' && req.method === 'POST') {
        return next();
    }
    
    const authHeader = req.headers.authorization; 

    // Verifica se o cabeçalho existe e se o formato é 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: "Não autorizado. Token Bearer não fornecido ou formato incorreto." });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Validação do Token Firebase
        const decodedToken = await getAuth().verifyIdToken(token);
        
        // Anexa o usuário à requisição (req.user e req.user.uid)
        req.user = decodedToken; 
        
        return next(); 
        
    } catch (error) {
        console.error('Erro de validação de token:', error);
        return res.status(401).send({ error: "Não autorizado. Token inválido ou expirado." });
    }
};

module.exports = isAuthenticated;