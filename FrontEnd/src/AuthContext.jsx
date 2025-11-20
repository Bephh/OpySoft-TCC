import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase-config'; 

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null); 
    const [loading, setLoading] = useState(true);

    // Função para atualizar os dados do usuário
    const updateProfileData = async (updates) => {
        if (!currentUser) throw new Error("Usuário não logado.");

        try {
            // Atualiza o perfil no Firebase Authentication (se houver displayName)
            if (updates.displayName) {
                await updateProfile(currentUser, { displayName: updates.displayName });
            }

            // Atualiza os dados no Firestore
            const docRef = doc(db, 'empresas', currentUser.uid);
            await updateDoc(docRef, updates);

            // Atualiza o estado local do userData para refletir as mudanças instantaneamente
            setUserData(prevData => ({
                ...prevData,
                ...updates,
            }));

        } catch (error) {
            console.error("Falha ao atualizar perfil e/ou dados da empresa:", error);
            throw error; 
        }
    };

    // Monitora o estado de autenticação do Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                try {
                    const docRef = doc(db, 'empresas', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        console.warn("Dados da empresa não encontrados no Firestore.");
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário:", error);
                    setUserData(null);
                }
            } else {
                setUserData(null); 
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
        userData, 
        loading,
        logout,
        updateProfileData, // Exporta a função de atualização
    };

    if (loading) {
        return <div className='flex items-center justify-center h-screen bg-gray-900 text-white'>Carregando...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};