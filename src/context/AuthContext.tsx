import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient, AuthUser, AuthConfig } from '../lib/authClient';

export type AuthModalView = 'signin' | 'signup' | 'otp' | 'forgot-password' | 'reset-password';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  config: AuthConfig | null;
  isLoginModalOpen: boolean;
  modalView: AuthModalView;
  pendingEmail: string;
  pendingPurpose: 'signup_verification' | 'password_reset';
  intendedRoute: string | null;
  setIntendedRoute: (route: string | null) => void;
  openLoginModal: (view?: AuthModalView, email?: string) => void;
  closeLoginModal: () => void;
  clearAuthError: () => void;
  setModalView: (view: AuthModalView) => void;
  setPendingEmail: (email: string) => void;
  setPendingPurpose: (purpose: 'signup_verification' | 'password_reset') => void;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string, recaptchaToken?: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signupWithEmail: (email: string, password: string, displayName?: string, recaptchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string, recaptchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (recaptchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string, recaptchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (code: string, newPassword: string, recaptchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [modalView, setModalView] = useState<AuthModalView>('signin');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingPurpose, setPendingPurpose] = useState<'signup_verification' | 'password_reset'>('signup_verification');
  const [intendedRoute, setIntendedRoute] = useState<string | null>(null);

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
      setIsLoggingIn(false);
      setModalView('signin');
      setIsLoginModalOpen(true);
      // Clean query parameter from URL without reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (authSuccessParam) {
      setIsLoggingIn(false);
      // Clean query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    fetchUserAndConfig();
  }, []);

  const loginWithGoogle = () => {
    setIsLoggingIn(true);
    setAuthError(null);
    AuthClient.loginWithGoogle();
  };

  const loginWithEmail = async (email: string, password: string, recaptchaToken?: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await AuthClient.loginWithEmail({ email, password, recaptchaToken });
      if (!res.success) {
        if (res.requiresVerification) {
          setPendingEmail(res.email || email);
          setPendingPurpose('signup_verification');
          setModalView('otp');
          setAuthError(res.error || 'Please enter the 6-digit code sent to your email.');
          return { success: false, error: res.error, requiresVerification: true };
        }
        setAuthError(res.error || 'Invalid email or password.');
        return { success: false, error: res.error };
      }
      if (res.user) {
        setUser(res.user);
        setIsLoginModalOpen(false);
      }
      return { success: true };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, displayName?: string, recaptchaToken?: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await AuthClient.signup({ email, password, display_username: displayName, recaptchaToken });
      if (!res.success) {
        setAuthError(res.error || 'Failed to create account.');
        return { success: false, error: res.error };
      }
      setPendingEmail(res.email || email);
      setPendingPurpose('signup_verification');
      setModalView('otp');
      return { success: true };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const verifyOtp = async (code: string, recaptchaToken?: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await AuthClient.verifyOtp({
        email: pendingEmail,
        code,
        purpose: pendingPurpose,
        recaptchaToken
      });
      if (!res.success) {
        setAuthError(res.error || 'Verification failed.');
        return { success: false, error: res.error };
      }
      if (pendingPurpose === 'signup_verification' && res.user) {
        setUser(res.user);
        setIsLoginModalOpen(false);
      } else if (pendingPurpose === 'password_reset') {
        setModalView('reset-password');
      }
      return { success: true };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resendOtp = async (recaptchaToken?: string) => {
    setAuthError(null);
    try {
      const res = await AuthClient.resendOtp({
        email: pendingEmail,
        purpose: pendingPurpose,
        recaptchaToken
      });
      if (!res.success) {
        setAuthError(res.error || 'Failed to resend code.');
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (e: any) {
      setAuthError(e?.message || 'Failed to resend code.');
      return { success: false, error: e?.message };
    }
  };

  const forgotPassword = async (email: string, recaptchaToken?: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await AuthClient.forgotPassword({ email, recaptchaToken });
      if (!res.success) {
        setAuthError(res.error || 'Failed to process request.');
        return { success: false, error: res.error };
      }
      setPendingEmail(res.email || email);
      setPendingPurpose('password_reset');
      setModalView('reset-password');
      return { success: true };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resetPassword = async (code: string, newPassword: string, recaptchaToken?: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await AuthClient.resetPassword({
        email: pendingEmail,
        code,
        newPassword,
        recaptchaToken
      });
      if (!res.success) {
        setAuthError(res.error || 'Failed to reset password.');
        return { success: false, error: res.error };
      }
      if (res.user) {
        setUser(res.user);
        setIsLoginModalOpen(false);
      } else {
        setModalView('signin');
      }
      return { success: true };
    } finally {
      setIsLoggingIn(false);
    }
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

  const openLoginModal = (view: AuthModalView = 'signin', email: string = '') => {
    setIsLoggingIn(false);
    setModalView(view);
    if (email) setPendingEmail(email);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoggingIn(false);
    setIsLoginModalOpen(false);
  };

  const clearAuthError = () => {
    setAuthError(null);
    setIsLoggingIn(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    isLoggingIn,
    authError,
    config,
    isLoginModalOpen,
    modalView,
    pendingEmail,
    pendingPurpose,
    intendedRoute,
    setIntendedRoute,
    openLoginModal,
    closeLoginModal,
    clearAuthError,
    setModalView,
    setPendingEmail,
    setPendingPurpose,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
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
