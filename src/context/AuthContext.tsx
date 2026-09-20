import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthApiClient, SafeUser, formatErrorMessage } from '../lib/authClient';

interface AuthContextType {
  currentUser: SafeUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (username: string, password: string) => Promise<SafeUser>;
  register: (username: string, password: string) => Promise<SafeUser>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isLoading: true,
  authError: null,
  clearAuthError: () => {},
  login: async () => { throw new Error('AuthContext not initialized'); },
  register: async () => { throw new Error('AuthContext not initialized'); },
  signOut: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize session on mount using HttpOnly cookie or in-memory session token
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const user = await AuthApiClient.getSession();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
            setIsAdmin(user.role === 'admin');
          } else {
            setCurrentUser(null);
            setIsAdmin(false);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (username: string, password: string): Promise<SafeUser> => {
    setAuthError(null);
    try {
      const user = await AuthApiClient.login(username, password);
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
      return user;
    } catch (err: any) {
      const msg = formatErrorMessage(err, 'Invalid username or password.');
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const handleRegister = async (username: string, password: string): Promise<SafeUser> => {
    setAuthError(null);
    try {
      const user = await AuthApiClient.register(username, password);
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
      return user;
    } catch (err: any) {
      const msg = formatErrorMessage(err, 'Unable to create account. Please try again.');
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthApiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setIsAdmin(false);
      setAuthError(null);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      isLoading,
      authError,
      clearAuthError,
      login: handleLogin,
      register: handleRegister,
      signOut: handleSignOut,
      logout: handleSignOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
