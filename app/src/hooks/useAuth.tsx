import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authApi } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  subscription_plan?: 'free' | 'regular' | 'premium';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      await authApi.fetchCsrfToken();
      const avatar = getMediaUrl(data.avatar);
      setUser({ ...data, avatar, name: data.first_name || data.username });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.reload();
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      setUser(null);
      window.location.reload();
    }
  }, []);

  const ctxValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refresh: fetchUser,
  };

  return (
    <AuthContext.Provider value={ctxValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
