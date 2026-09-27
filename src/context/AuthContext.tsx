import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient, AuthUser, AuthConfig } from '../lib/authClient';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  config: AuthConfig | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  clearAuthError: () => void;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const fetchUserAndConfig = async () => {
    setIsLoading(true);
    try {
      const [cfg, currentUser] = await Promise.all([
        AuthClient.getAuthConfig(),
        AuthClient.getCurrentUser()
      ]);
      setConfig(cfg);
      setUser(currentUser);
    } catch (e: any) {
      console.error('Error fetching auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check URL parameters for OAuth callbacks
    const params = new URLSearchParams(window.location.search);
    const authErrorParam = params.get('auth_error');
    const authSuccessParam = params.get('auth_success');

    if (authErrorParam) {
      setAuthError(authErrorParam);
      // Clean query parameter from URL without reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (authSuccessParam) {
      // Clean query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    fetchUserAndConfig();
  }, []);

  const loginWithGoogle = () => {
    AuthClient.loginWithGoogle();
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthClient.logout();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthClient.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const clearAuthError = () => setAuthError(null);

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    authError,
    config,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    clearAuthError,
    loginWithGoogle,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
