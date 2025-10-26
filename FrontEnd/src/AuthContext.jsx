import React, { createContext, useContext, useEffect, useState } from 'react';
// 1. Importar funções de atualização do Firebase
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'; 
// 2. Importar funções de manipulação do Firestore
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase-config'; 

// Cria o contexto
const AuthContext = createContext();

// Hook customizado para usar o contexto
export const useAuth = () => {
    return useContext(AuthContext);
};

// Provedor de Contexto (Wrapper)
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null); 
    const [loading, setLoading] = useState(true);

    // Função para atualizar os dados do usuário
    // Recebe o novo nome de exibição e a URL da foto
    const updateProfileData = async ({ displayName, photoURL }) => {
        if (!currentUser) throw new Error("Usuário não logado.");

        // Objeto de atualizações para o Firebase Auth
        const authUpdates = {
            displayName: displayName,
            photoURL: photoURL,
        };
        
        // Objeto de atualizações para o Firestore (Coleção 'empresas')
        const firestoreUpdates = {
            nome_empresa: displayName, // Assumindo que você quer sincronizar
            photoURL: photoURL,
        };

        try {
            // 1. Atualiza o perfil no Firebase Authentication
            await updateProfile(currentUser, authUpdates);

            // 2. Atualiza os dados no Firestore na coleção 'empresas'
            const docRef = doc(db, 'empresas', currentUser.uid);
            await updateDoc(docRef, firestoreUpdates);

            // 3. Atualiza os estados locais (currentUser e userData) para refletir na UI imediatamente
            
            // Atualiza currentUser com os novos dados do Firebase Auth
            setCurrentUser(prevUser => ({
                ...prevUser,
                ...authUpdates,
            }));

            // Atualiza userData com os novos dados do Firestore
            setUserData(prevData => ({
                ...prevData,
                ...firestoreUpdates,
            }));

        } catch (error) {
            console.error("Falha ao atualizar perfil e/ou dados da empresa:", error);
            throw error; // Re-lança o erro para ser tratado no modal
        }
    };


    // Monitora o estado de autenticação do Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                // Se o usuário está logado, busca os dados no Firestore (Coleção 'empresas')
                try {
                    const docRef = doc(db, 'empresas', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        // Combina o objeto user do Auth com os dados da empresa do Firestore
                        const companyData = docSnap.data();
                        setUserData(companyData);
                        // Garante que o estado currentUser também inclua dados do Auth (como photoURL/displayName)
                        setCurrentUser(prevUser => ({
                            ...prevUser,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                        }));

                    } else {
                        console.error("Dados da empresa não encontrados no Firestore.");
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário:", error);
                    setUserData(null);
                }
            } else {
                setUserData(null); // Limpa os dados se deslogado
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Função de Logout
    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userData, // Contém o nome_empresa
        loading,
        logout,
        updateProfileData, // 4. EXPOR a nova função
    };

    if (loading) {
        // Tela de carregamento enquanto o estado de autenticação é verificado
        return <div className='flex items-center justify-center h-screen bg-[#0f172a] text-white'>Carregando...</div>;
    }

    

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    
};