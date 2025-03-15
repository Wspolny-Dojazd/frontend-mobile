import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

interface User {
  id: number;
  nickname: string;
  email: string;
  jwtToken: string;
}

interface AuthContextType {
  user: User | null;
  register: (nickname: string, email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  getUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const dev = true;

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  const mockUser: User = {
    id: 1,
    nickname: 'user',
    email: 'user@example.com',
    jwtToken: 'user-jwt-token',
  };

  const register = async (nickname: string, email: string, password: string): Promise<User> => {
    if (dev) {
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }

    try {
      const response = await fetch('https://sggw/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const newUser: User = {
        id: data.id,
        nickname: data.nickname,
        email: data.email,
        jwtToken: data.jwtToken,
      };

      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    if (dev) {
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
    try {
      const response = await fetch('https://sggw/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const loggedInUser: User = {
        id: data.id,
        nickname: data.nickname,
        email: data.email,
        jwtToken: data.jwtToken,
      };

      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const getUser = async (): Promise<User | null> => {
    if (dev) {
      return mockUser;
    }

    const storedUser = await AsyncStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, getUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
