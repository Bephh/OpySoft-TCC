import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx'; 

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Enquanto o estado de autenticação está sendo carregado
  if (loading) {
    // Tela de carregamento (você deve ver isso por um momento)
    return (
      <div className='flex items-center justify-center h-screen bg-[#0f172a] text-white text-lg font-semibold'>
        Carregando...
      </div>
    );
  }

  // Se o usuário está logado, renderiza o componente filho (Dashboard)
  if (currentUser) {
    return children;
  }

  // Se não está logado, redireciona para a página de login
  return <Navigate to="/login" replace />;
}