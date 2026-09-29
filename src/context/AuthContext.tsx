import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, tokenStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  unreadNotifs: number;
  login: (data: { identifier: string; password: string }) => Promise<User>;
  adminLogin: (data: { email: string; password: string }) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const refreshUser = async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.auth.me();
      setUser(res.user);
      setUnreadNotifs(res.unreadNotifs || 0);
    } catch {
      tokenStorage.remove();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: { identifier: string; password: string }) => {
    const res = await api.auth.login(data);
    tokenStorage.set(res.token);
    setUser(res.user);
    await refreshUser();
    return res.user;
  };

  const adminLogin = async (data: { email: string; password: string }) => {
    const res = await api.auth.adminLogin(data);
    tokenStorage.set(res.token);
    setUser(res.user);
    await refreshUser();
    return res.user;
  };

  const register = async (data: any) => {
    const res = await api.auth.register(data);
    tokenStorage.set(res.token);
    setUser(res.user);
    await refreshUser();
    return res.user;
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.auth.updateProfile(data);
    setUser(res.user);
    return res.user;
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isStudent,
        unreadNotifs,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
