import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem('shopr_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('shopr_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem('shopr_access_token') || '');
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('shopr_refresh_token') || '');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('shopr_user', JSON.stringify(user));
    else localStorage.removeItem('shopr_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('shopr_access_token', token);
    else localStorage.removeItem('shopr_access_token');
  }, [token]);

  useEffect(() => {
    if (refreshToken) localStorage.setItem('shopr_refresh_token', refreshToken);
    else localStorage.removeItem('shopr_refresh_token');
  }, [refreshToken]);

  const applyAuthPayload = (payload) => {
    setUser(payload.user || null);
    setToken(payload.access_token || '');
    setRefreshToken(payload.refresh_token || refreshToken || '');
    setIsAuthReady(true);
    return payload.user || null;
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    return applyAuthPayload(data);
  };

  const signup = async (email, username, full_name, password) => {
    const data = await api.signup(email, username, full_name, password);
    return applyAuthPayload(data);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setRefreshToken('');
    setIsAuthReady(true);
  };

  const refreshSession = async () => {
    if (!refreshToken) return null;
    const data = await api.refresh(refreshToken);
    return applyAuthPayload(data);
  };

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      if (!token) {
        if (!cancelled) setIsAuthReady(true);
        return;
      }
      try {
        const me = await api.me(token);
        if (!cancelled) {
          setUser(me);
          setIsAuthReady(true);
        }
      } catch {
        try {
          if (!cancelled) await refreshSession();
        } catch {
          if (!cancelled) logout();
        }
      }
    };
    boot();
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    refreshToken,
    isAuthReady,
    isLoggedIn: Boolean(isAuthReady && user && token),
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout,
    refreshSession,
  }), [user, token, refreshToken, isAuthReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
