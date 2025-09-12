import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';

interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  token?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  onLogin: (callback: () => void) => () => void;
  onLogout: (callback: () => void) => () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
  onLogin: () => () => {},
  onLogout: () => () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [loginListeners, setLoginListeners] = useState<(() => void)[]>([]);
  const onLogin = useCallback((callback: () => void) => {
    setLoginListeners(prev => [...prev, callback]);
    return () => setLoginListeners(prev => prev.filter(cb => cb !== callback));
  }, []);

  const verifyToken = (token: string): User | null => {
      try {
        const decoded = jwtDecode<any>(token);
        const user: User = {
          _id: decoded?._id,
          name: decoded?.name,
          email: decoded?.email,
          phone: decoded?.phone,
          token,
        };
        return user;
      } catch (error) { return null; }
    };

  const login = (token: string, userData: User) => {
    Cookies.set('authToken', token, { expires: 7, path: '/' });
    setIsLoggedIn(true);
    setUser(userData);
    loginListeners.forEach(cb => cb());
  };

  const [logoutListeners, setLogoutListeners] = useState<(() => void)[]>([]);

  const onLogout = useCallback((callback: () => void) => {
    setLogoutListeners(prev => [...prev, callback]);
    return () => setLogoutListeners(prev => prev.filter(cb => cb !== callback));
  }, []);

  const logout = () => {
    Cookies.remove('authToken');
    setIsLoggedIn(false);
    setUser(null);
    logoutListeners.forEach(cb => cb()); 
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get('authToken');
        if (token) {
          const userData = await verifyToken(token);
          if (userData) {
            setIsLoggedIn(true);
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        Cookies.remove('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);