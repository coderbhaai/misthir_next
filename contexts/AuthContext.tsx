import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";

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
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshAccess: () => Promise<void>;
  isLoading: boolean;
  onLogin: (callback: () => void) => () => void;
  onLogout: (callback: () => void) => () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
  canAccess: (modelName: string, id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  roles: [],
  permissions: [],
  login: async () => {},
  logout: () => {},
  refreshAccess: async () => {},
  isLoading: false,
  onLogin: () => () => {},
  onLogout: () => () => {},
  hasRole: () => false,
  hasPermission: () => false,
  can: () => false,
  canAny: () => false,
  canAll: () => false,
  canAccess: async () => false,
});

export const useUserId = () => {
  const { user } = useAuth();
  return user?._id ?? null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [loginListeners, setLoginListeners] = useState<(() => void)[]>([]);
  const [logoutListeners, setLogoutListeners] = useState<(() => void)[]>([]);

  const onLogin = useCallback((callback: () => void) => {
    setLoginListeners(prev => [...prev, callback]);
    return () => setLoginListeners(prev => prev.filter(cb => cb !== callback));
  }, []);


  const onLogout = useCallback((callback: () => void) => {
    setLogoutListeners(prev => [...prev, callback]);
    return () => setLogoutListeners(prev => prev.filter(cb => cb !== callback));
  }, []);

  const verifyToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<User>(token);
      if (!decoded?._id) return null;

      return {
        _id: decoded._id,
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone,
        token,
      };
    } catch { return null; }
  };

  const refreshAccess = useCallback(async () => {
    try {
      const res = await apiRequest("POST", "basic/auth", {
                    function: "check_user_access"
                  });

      setRoles(res?.data?.roles ?? []);
      setPermissions(res?.data?.permissions ?? []);
    } catch {
      setRoles([]);
      setPermissions([]);
    }
  }, []);

  const login = async (token: string) => {
    Cookies.set("authToken", token, {
      expires: 7,
      path: "/",
      sameSite: "lax",
    });

    const userData = verifyToken(token);

    if (!userData) {
      Cookies.remove("authToken");
      return;
    }

    setUser(userData);
    setIsLoggedIn(true);

    await refreshAccess();

    loginListeners.forEach(cb => cb());
  };

  const logout = () => {
    Cookies.remove("authToken");

    setUser(null);
    setRoles([]);
    setPermissions([]);

    setIsLoggedIn(false);

    logoutListeners.forEach(cb => cb());
  };

  const permissionSet = useMemo( () => new Set(permissions.map(i => i.name?.toLowerCase())), [permissions] );
  const roleSet = useMemo( () => new Set(roles.map(i => i.name?.toLowerCase())), [roles] );
  const hasRole = useCallback( (role: string) => roleSet.has(role.toLowerCase()), [roleSet] );
  const hasPermission = useCallback( (permission: string) => permissionSet.has(permission.toLowerCase()), [permissionSet] );

  const can = hasPermission;
  const canAny = useCallback( (permissionList: string[]) => permissionList.some(i => permissionSet.has(i.toLowerCase())), [permissionSet] );
  const canAll = useCallback( (permissionList: string[]) => permissionList.every(i => permissionSet.has(i.toLowerCase())), [permissionSet] );

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) return;

        const userData = verifyToken(token);
        if (!userData) { Cookies.remove("authToken"); return; }

        setUser(userData);
        setIsLoggedIn(true);

        await refreshAccess();
      } finally { setIsLoading(false); }
    };

    initialize();
  }, [refreshAccess]);

  const canAccess = useCallback(async (modelName: string, id: string): Promise<boolean> => {
    if (!id || !modelName) return false;

    try {
      const res = await apiRequest("POST", "basic/spatie", {
        function: "canUserAccessDocument",
        modelName,
        id
      });
      return res?.allowed === true;
    } catch { return false; }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        roles,
        permissions,
        login,
        logout,
        refreshAccess,
        isLoading,
        onLogin,
        onLogout,
        hasRole,
        hasPermission,
        can,
        canAny,
        canAll,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);