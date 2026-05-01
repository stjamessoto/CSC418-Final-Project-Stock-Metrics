import { createContext, useContext, useState } from 'react';

type AuthCtx = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );
  const [userId, setUserId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  );

  const login = (t: string, uid: string) => {
    localStorage.setItem('token', t);
    localStorage.setItem('userId', uid);
    setToken(t);
    setUserId(uid);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
