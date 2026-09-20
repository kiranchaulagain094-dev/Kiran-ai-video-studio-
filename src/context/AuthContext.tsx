import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthApiClient, SafeUser } from '../lib/authClient';

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

const DEFAULT_CREATOR: SafeUser = {
  id: 'usr_studio_creator',
  username: 'Kiran Studio Creator',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00Z',
  avatar: 'https://ui-avatars.com/api/?name=Kiran+Studio&background=6366f1&color=fff'
};

const AuthContext = createContext<AuthContextType>({
  currentUser: DEFAULT_CREATOR,
  isAdmin: true,
  isLoading: false,
  authError: null,
  clearAuthError: () => {},
  login: async () => DEFAULT_CREATOR,
  register: async () => DEFAULT_CREATOR,
  signOut: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(DEFAULT_CREATOR);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Optionally sync with backend session if available, otherwise keep default creator
    let isMounted = true;
    async function checkBackend() {
      try {
        const user = await AuthApiClient.getSession();
        if (isMounted && user) {
          setCurrentUser(user);
          setIsAdmin(user.role === 'admin');
        }
      } catch {
        // Fallback remains DEFAULT_CREATOR
      }
    }
    checkBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (): Promise<SafeUser> => DEFAULT_CREATOR;
  const handleRegister = async (): Promise<SafeUser> => DEFAULT_CREATOR;
  const handleSignOut = async () => {};
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

