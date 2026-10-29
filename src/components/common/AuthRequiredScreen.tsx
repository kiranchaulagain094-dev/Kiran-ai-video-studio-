import React from 'react';
import { 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Video, 
  Layers, 
  Film, 
  Cloud 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthRequiredScreenProps {
  toolName: string;
  toolDescription: string;
  intendedRoute?: string;
}

export const AuthRequiredScreen: React.FC<AuthRequiredScreenProps> = ({
  toolName,
  toolDescription,
  intendedRoute
}) => {
  const { openLoginModal, loginWithGoogle, isLoggingIn, setIntendedRoute } = useAuth();

  const handleOpenAuth = (view: 'signin' | 'signup') => {
    if (intendedRoute) {
      setIntendedRoute(intendedRoute);
    }
    openLoginModal(view);
  };

  const handleGoogleLogin = () => {
    if (intendedRoute) {
      setIntendedRoute(intendedRoute);
    }
    loginWithGoogle();
  };

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-14 p-6 sm:p-10 rounded-3xl bg-[#0e121d] border border-cyan-500/25 shadow-2xl shadow-cyan-950/40 text-center relative overflow-hidden animate-fade-in">
      {/* Ambient background glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-cyan-500/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 right-10 w-48 h-48 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top Security Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6">
        <Lock className="w-3.5 h-3.5 text-cyan-400" />
        <span>Secure Creator Authentication Required</span>
      </div>

      {/* Heading & Tool Context */}
      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
        Sign In to Access {toolName}
      </h2>

      <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed mb-8">
        {toolDescription || 'To protect creative workflows, video compute quotas, and user privacy, an authenticated creator account is required.'}
      </p>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8">
        <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Veo & Gemini AI Studio</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">High-definition AI video planning and rendering engine.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Neon PostgreSQL Sync</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Automated cloud persistence across all your devices.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Timeline Video Studio</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Multi-scene video planner with audio beat markers.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">End-to-End Privacy</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Your scripts, assets, and plans are securely protected.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto space-y-3">
        <button
          type="button"
          onClick={() => handleOpenAuth('signin')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-cyan-950/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Sign In with Email & Password</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAuth('signup')}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#1a2030] hover:bg-[#20273a] text-cyan-300 font-bold text-xs border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Free Account</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-6">
        Free to register. Includes 6-digit email confirmation for account verification.
      </p>
    </div>
  );
};
