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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('quilbox-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string, role: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = mockUsers[email] || {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      role,
      phone: '+91 00000 00000',
    };
    
    mockUser.role = role;
    setUser(mockUser);
    localStorage.setItem('quilbox-user', JSON.stringify(mockUser));
  };

  const signup = async (data: SignupData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
      location: data.location,
      languages: data.role === 'delivery_partner' ? ['English'] : undefined,
    };
    
    setUser(newUser);
    localStorage.setItem('quilbox-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quilbox-user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
