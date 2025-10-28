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
    const updateProfileData = async ({ displayName, photoURL }) => {
        if (!currentUser) throw new Error("Usuário não logado.");

        const authUpdates = {
            displayName: displayName,
            photoURL: photoURL,
        };
        
        const firestoreUpdates = {
            nome_empresa: displayName, 
            photoURL: photoURL,
        };

        try {
            // 1. Atualiza o perfil no Firebase Authentication
            await updateProfile(currentUser, authUpdates);

            // 2. Atualiza os dados no Firestore
            const docRef = doc(db, 'empresas', currentUser.uid);
            await updateDoc(docRef, firestoreUpdates);

            // 3. Atualiza os estados locais 
            
            setCurrentUser(prevUser => ({
                ...prevUser,
                ...authUpdates,
            }));

            // Atualiza userData 
            setUserData(prevData => ({
                ...prevData,
                ...firestoreUpdates,
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
                // Se o usuário está logado busca os dados no Firestore 
                try {
                    const docRef = doc(db, 'empresas', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const companyData = docSnap.data();
                        setUserData(companyData);
                        
                       
                        setCurrentUser(prevUser => ({
                            ...user, 
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                        }));

                    } else {
                        console.warn("Dados da empresa não encontrados no Firestore. Pode ser um usuário recém-criado.");
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
        updateProfileData, 
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