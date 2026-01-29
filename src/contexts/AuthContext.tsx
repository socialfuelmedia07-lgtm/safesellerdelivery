import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'seller' | 'delivery_partner';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  location?: string;
  languages?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  checkUser: (identifier: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  location?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const mockUsers: Record<string, User> = {
  'seller@quilbox.com': {
    id: 's1',
    email: 'seller@quilbox.com',
    name: 'Priya Sharma',
    role: 'seller',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
  },
  'driver@quilbox.com': {
    id: 'd1',
    email: 'driver@quilbox.com',
    name: 'Rahul Kumar',
    role: 'delivery_partner',
    phone: '+91 98765 12345',
    languages: ['Hindi', 'English'],
  },
};

const API_URL = 'http://localhost:5001/api/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('quilbox-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (identifier: string, password: string, role: UserRole) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      localStorage.setItem('quilbox-user', JSON.stringify(data.user));
      localStorage.setItem('quilbox-token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Signup failed');
      }

      setUser(resData.user);
      localStorage.setItem('quilbox-user', JSON.stringify(resData.user));
      localStorage.setItem('quilbox-token', resData.token);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quilbox-user');
    localStorage.removeItem('quilbox-token');
  };

  const checkUser = async (identifier: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, role }),
      });
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Check user error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};
