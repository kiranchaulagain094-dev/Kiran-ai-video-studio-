import React, { useState } from 'react';
import { 
  Sparkles, 
  Film, 
  Music, 
  Youtube, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  Video,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WelcomeLoginPageProps {
  onLoginSuccess?: () => void;
}

export const WelcomeLoginPage: React.FC<WelcomeLoginPageProps> = ({ onLoginSuccess }) => {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      const user = await signInWithGoogle();
      if (user) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // Friendly, non-technical error handling as requested
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in window was closed. Please try again.');
      } else if (err?.code === 'auth/network-request-failed') {
        setErrorMessage('Network connection error. Please check your internet and retry.');
      } else {
        setErrorMessage('Google sign-in was not completed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090b10] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-violet-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
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
                Create • Edit • Optimize • Publish
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Google Access</span>
          </div>
        </div>
      </header>

      {/* Main Hero & Sign-In Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Main Card */}
          <div className="relative rounded-3xl bg-[#10141e]/90 border border-white/10 p-8 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* Subtle glow rim */}
            <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            {/* Brand Logo & Titles */}
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/30 mb-2">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              
              <h1 id="login-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Kiran AI Video Studio
              </h1>

              <p className="text-base font-medium text-slate-300">
                Create smarter content with AI.
              </p>

              <div className="pt-2">
                <p className="text-xs uppercase tracking-widest font-bold text-indigo-400">
                  Sign in with Google to continue
                </p>
              </div>
            </div>

            {/* Error Message Notice */}
            {errorMessage && (
              <div 
                id="login-error-alert" 
                className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Primary Google Auth Button */}
            <button
              id="continue-with-google-main-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3.5 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-white/5 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isSigningIn ? (
                <div className="flex items-center gap-2.5 text-slate-800">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  {/* Real Official Google Multi-Colored 'G' Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="text-slate-900 tracking-tight">Continue with Google</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all ml-auto" />
                </>
              )}
            </button>

            {/* Feature Access Highlights */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>AI Video & Multi-Scene Production Planner</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>YouTube Shorts, TikTok, & Music Video Planner</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Private personal cloud workspace for your projects</span>
              </div>
            </div>

            {/* Privacy note */}
            <div className="mt-6 text-center">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                By continuing, you access your isolated creator account. Your projects, scripts, and drafts are private to your Google account.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#090b10] py-4 px-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Kiran AI Video Studio. All rights reserved.</span>
          <span>Protected Cloud Workspace • Powered by Google AI</span>
        </div>
      </footer>
    </div>
  );
};
