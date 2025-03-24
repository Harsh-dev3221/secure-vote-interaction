
import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyAdminCredentials } from '@/utils/crypto';

type AuthContextType = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (voterId: string) => void;
  adminLogin: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Check session storage on initial load
  useEffect(() => {
    const authToken = sessionStorage.getItem('auth_token');
    const userRole = sessionStorage.getItem('user_role');
    
    if (authToken) {
      setIsAuthenticated(true);
      setIsAdmin(userRole === 'admin');
    }
  }, []);
  
  const login = (voterId: string) => {
    sessionStorage.setItem('auth_token', 'sample_secure_token');
    sessionStorage.setItem('voter_id', voterId);
    sessionStorage.setItem('user_role', 'voter');
    setIsAuthenticated(true);
    setIsAdmin(false);
  };
  
  const adminLogin = (username: string, password: string): boolean => {
    const isValid = verifyAdminCredentials(username, password);
    
    if (isValid) {
      sessionStorage.setItem('auth_token', 'admin_secure_token');
      sessionStorage.setItem('user_role', 'admin');
      setIsAuthenticated(true);
      setIsAdmin(true);
    }
    
    return isValid;
  };
  
  const logout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('voter_id');
    sessionStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
