import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  FolderGit2, 
  AlertCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    loginWithGoogle, 
    authError, 
    clearAuthError,
    config,
    isLoading 
  } = useAuth();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#0f1320] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kiran AI Studio Account</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sign In with Google
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Connect your Google account to access Neon PostgreSQL cloud project storage and sync your AI video creations.
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="font-semibold text-rose-200">Authentication Alert</div>
              <p className="break-words">{authError}</p>
              <button 
                type="button" 
                onClick={clearAuthError}
                className="text-[11px] underline text-rose-400 hover:text-rose-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="space-y-3">
          <button
            type="button"
            id="google-signin-btn"
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold text-sm shadow-xl shadow-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {/* Real Official Google 'G' SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-[11px] text-center text-slate-500">
            Uses server-side OAuth 2.0 code exchange. Client secrets are never exposed.
          </p>
        </div>

        {/* Benefits List */}
        <div className="pt-2 border-t border-white/5 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Save & edit video timeline plans in <strong>Neon PostgreSQL</strong></span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict per-user data isolation and project ownership</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure HttpOnly cookie session management</span>
          </div>
        </div>

        {/* Server & DB Status */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Database:</span>
            <span className={config?.database ? 'text-emerald-400 font-mono font-semibold' : 'text-amber-400 font-mono'}>
              {config?.database ? 'Neon PostgreSQL Connected' : 'Checking...'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google OAuth:</span>
            <span className={config?.googleOAuth ? 'text-emerald-400 font-mono font-semibold' : 'text-slate-400 font-mono'}>
              {config?.googleOAuth ? 'Ready' : 'Vercel Env'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
