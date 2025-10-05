import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';

interface Role {
  _id: string;
  name: string;
}

interface Permission {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  token?: string;
  roles?: Role[];
  permissions?: Permission[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  onLogin: (callback: () => void) => () => void;
  onLogout: (callback: () => void) => () => void;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
  onLogin: () => () => {},
  onLogout: () => () => {},
  hasRole: () => false,
  hasPermission: () => false,
});

export const useUserId = () => {
  const { user } = useAuth();
  return user?._id || null;
};

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
      const decoded = jwtDecode<User>(token);
      if (!decoded || !decoded._id) return null;
      return {
        _id: decoded._id,
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        token,
      };
    } catch {
      return null;
    }
  };

  const login = (token: string) => {
    Cookies.set('authToken', token, { expires: 7, path: '/' });
    const userData = verifyToken(token);
    if (userData) {
      setIsLoggedIn(true);
      setUser(userData);
      loginListeners.forEach(cb => cb());
    } else {
      Cookies.remove('authToken');
    }
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

  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.some(perm => perm.name.toLowerCase() === permissionName.toLowerCase());
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get('authToken');
        if (token) {
          const userData = verifyToken(token);
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
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        isLoading,
        onLogin,
        onLogout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);