import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { authAPI } from './api';

interface User {
  id: string;
  email: string;
  full_name?: string;
  plan: string;
  credits_remaining: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data;

      Cookies.set('token', token, { expires: 30 });
      Cookies.set('user', JSON.stringify(userData), { expires: 30 });
      setUser(userData);

      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (email: string, password: string, full_name?: string) => {
    try {
      const response = await authAPI.register({ email, password, full_name });
      const { user: userData, token } = response.data;

      Cookies.set('token', token, { expires: 30 });
      Cookies.set('user', JSON.stringify(userData), { expires: 30 });
      setUser(userData);

      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    Cookies.set('user', JSON.stringify(updatedUser), { expires: 30 });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
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
