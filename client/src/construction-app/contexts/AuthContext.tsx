/**
 * 🔐 AUTHENTICATION CONTEXT - Real JWT Auth
 * =========================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { constructionApi } from '../api/constructionApi';

interface User {
  id: string;
  email: string;
  organization?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, organization: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('auth_token');
    if (token) {
      constructionApi.setToken(token);
      // Verify token is still valid
      constructionApi.healthCheck()
        .then(() => {
          // Token valid, set user
          const userStr = localStorage.getItem('user');
          if (userStr) {
            setUser(JSON.parse(userStr));
          }
        })
        .catch(() => {
          // Token invalid, clear
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await constructionApi.login(email, password);
    const userData = { id: response.userId || email, email };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const register = async (email: string, password: string, organization: string) => {
    const response = await constructionApi.register(email, password, organization);
    const userData = { id: response.userId || email, email, organization };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

