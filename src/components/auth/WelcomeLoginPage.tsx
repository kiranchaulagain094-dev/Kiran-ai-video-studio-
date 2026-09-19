import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WelcomeLoginPageProps {
  onLoginSuccess?: () => void;
}

export const WelcomeLoginPage: React.FC<WelcomeLoginPageProps> = ({ onLoginSuccess }) => {
  const { login, register, authError, clearAuthError } = useAuth();
  
  // Tab state: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors when switching tabs
  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setLocalError(null);
    clearAuthError();
  };

  const validateInputs = (): boolean => {
    setLocalError(null);
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setLocalError('Please enter a username.');
      return false;
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      setLocalError('Username must be between 3 and 30 characters.');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setLocalError('Username can only contain letters, numbers, and underscores.');
      return false;
    }

    if (!password) {
      setLocalError('Please enter a password.');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return false;
    }

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      if (activeTab === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setLocalError(err.message || (activeTab === 'login' ? 'Invalid username or password.' : 'Registration failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeErrorMessage = localError || authError;

  return (
    <div className="min-h-screen w-full bg-[#090b10] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-violet-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full border-b border-white/5 bg-[#0d1017]/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block">
                Kiran AI Video Studio
              </span>
              <span className="text-[11px] text-indigo-400 font-medium tracking-wider uppercase">
                Custom Secure Authentication
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Session • Isolated Workspace</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md mx-auto">
          <div className="relative rounded-3xl bg-[#10141e]/90 border border-white/10 p-7 sm:p-9 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* Top border highlight */}
            <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            {/* Brand icon and headline */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/30 mb-1">
                {activeTab === 'login' ? (
                  <KeyRound className="w-6 h-6 text-white" />
                ) : (
                  <UserPlus className="w-6 h-6 text-white" />
                )}
              </div>
              <h1 id="auth-heading" className="text-2xl font-black text-white tracking-tight">
                {activeTab === 'login' ? 'Sign In to Your Studio' : 'Create Your Account'}
              </h1>
              <p className="text-xs text-slate-400">
                {activeTab === 'login' 
                  ? 'Access your private AI projects and video generator.' 
                  : 'Register with a username and password to get started.'}
              </p>
            </div>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold">
              <button
                id="tab-sign-in"
                type="button"
                onClick={() => switchTab('login')}
                className={`py-2 px-3 rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-create-account"
                type="button"
                onClick={() => switchTab('register')}
                className={`py-2 px-3 rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message Notice */}
            {activeErrorMessage && (
              <div 
                id="auth-error-alert" 
                className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="leading-snug">{activeErrorMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. kiran_creator"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090b10] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
                {activeTab === 'register' && (
                  <p className="text-[11px] text-slate-500">
                    3 to 30 characters (letters, numbers, underscores).
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090b10] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  <button
                    id="toggle-password-visibility-btn"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {activeTab === 'register' && (
                  <p className="text-[11px] text-slate-500">
                    Minimum 6 characters. Encrypted securely with bcrypt.
                  </p>
                )}
              </div>

              {/* Confirm Password (Registration Only) */}
              {activeTab === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090b10] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{activeTab === 'login' ? 'Verifying credentials...' : 'Creating your account...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Features & Isolation Guarantee */}
            <div className="mt-6 pt-5 border-t border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Isolated workspace linked to your unique user ID</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Zero third-party trackers or external identity providers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>HttpOnly session cookies with rate limit protection</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#090b10] py-4 px-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Kiran AI Video Studio. All rights reserved.</span>
          <span>Custom Backend Authentication • Secure Private Storage</span>
        </div>
      </footer>
    </div>
  );
};
