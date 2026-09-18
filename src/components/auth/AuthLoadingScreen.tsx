import React from 'react';
import { Sparkles } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#090b10] flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
      
      <div className="relative flex flex-col items-center space-y-5 text-center max-w-sm">
        {/* Animated Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Kiran AI Video Studio
          </h1>
          <p className="text-sm font-medium text-indigo-400">
            Checking your account...
          </p>
        </div>

        {/* Smooth loading bar indicator */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>

        <p className="text-xs text-slate-500 pt-2">
          Verifying secure session
        </p>
      </div>
    </div>
  );
};
