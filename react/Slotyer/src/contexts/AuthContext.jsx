import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Função para carregar usuário do localStorage
  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('slotyer_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Carregar usuário no mount
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Listener para mudanças no localStorage (útil para múltiplas abas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'slotyer_user') {
        loadUserFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('slotyer_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('slotyer_user');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('slotyer_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoggedIn,
    handleLogin,
    handleLogout,
    handleUserUpdate,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};