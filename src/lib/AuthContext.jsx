// src/lib/AuthContext.jsx
// Contexto de Autenticação do StoryForge (Baseado em Cookies HttpOnly)

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient'; // Ajuste o caminho relativo para o apiClient se necessário

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verifica se o usuário já possui um cookie HttpOnly válido ao carregar a aplicação
   */
  const checkAuth = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        console.error('Falha temporária ao validar a sessão:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Função de Login
   * O backend responderá definindo o Cookie HttpOnly e retornando os dados do usuário.
   */
  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    setUser(response.data.user);
    return response.data;
  };

  /**
   * Função de Registro de Novo Usuário
   */
  const register = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  };

  /**
   * Função de Logout
   * Solicita ao backend para limpar o Cookie HttpOnly de sessão.
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao encerrar sessão no servidor:', error);
    } finally {
      setUser(null);
    }
  };

  /**
   * Atualiza os dados do perfil do usuário no estado local
   */
  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const updates = typeof updatedUserData === 'function'
        ? updatedUserData(prev)
        : updatedUserData;

      return updates ? { ...prev, ...updates } : prev;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para acessar o contexto de autenticação em qualquer componente
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};