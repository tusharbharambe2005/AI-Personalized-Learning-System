import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // true on first load while we re-hydrate from tokens

  // Re-hydrate from stored tokens on app startup
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      authApi.me()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          clearTokens();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for forced logout (e.g. refresh token expired)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password);
    setTokens(data.access, data.refresh);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    setTokens(data.access, data.refresh);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      await authApi.logout(refresh);
    } catch {
      // ignore — still clear tokens locally
    }
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading,
      login, register, logout, refreshUser,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
