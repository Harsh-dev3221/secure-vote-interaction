
import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyAdminCredentials } from '@/utils/crypto';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Check session storage on initial load
  useEffect(() => {
    const authToken = sessionStorage.getItem('auth_token');
    const userRole = sessionStorage.getItem('user_role');
    const sessionStartTime = sessionStorage.getItem('session_start_time');
    
    if (authToken) {
      // Validate session time
      if (sessionStartTime) {
        const startTime = parseInt(sessionStartTime, 10);
        const currentTime = Date.now();
        const sessionDuration = (currentTime - startTime) / 1000 / 60; // in minutes
        
        // If session is older than 2.5 minutes, clear it
        if (sessionDuration > 2.5) {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('voter_id');
          sessionStorage.removeItem('user_role');
          sessionStorage.removeItem('session_start_time');
          
          toast({
            title: "Session Expired",
            description: "Your previous session has expired. Please login again.",
            variant: "destructive",
          });
          
          return;
        }
      }
      
      setIsAuthenticated(true);
      setIsAdmin(userRole === 'admin');
    }
  }, [toast]);
  
  const login = (voterId: string) => {
    sessionStorage.setItem('auth_token', 'sample_secure_token');
    sessionStorage.setItem('voter_id', voterId);
    sessionStorage.setItem('user_role', 'voter');
    sessionStorage.setItem('session_start_time', Date.now().toString());
    setIsAuthenticated(true);
    setIsAdmin(false);
  };
  
  const adminLogin = (username: string, password: string): boolean => {
    const isValid = verifyAdminCredentials(username, password);
    
    if (isValid) {
      sessionStorage.setItem('auth_token', 'admin_secure_token');
      sessionStorage.setItem('user_role', 'admin');
      sessionStorage.setItem('session_start_time', Date.now().toString());
      setIsAuthenticated(true);
      setIsAdmin(true);
    }
    
    return isValid;
  };
  
  const logout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('voter_id');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('session_start_time');
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
