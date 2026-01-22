import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { createOrGetUser, getUser } from '../utils/api';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'human_benchmark_user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        // Verify user still exists on server
        getUser(userData.id)
          .then(user => {
            setUser(user);
            setLoading(false);
          })
          .catch(() => {
            localStorage.removeItem(USER_STORAGE_KEY);
            setLoading(false);
          });
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await createOrGetUser(username);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      setUser(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to login');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
