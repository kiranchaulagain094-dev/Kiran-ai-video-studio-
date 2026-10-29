import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle,
  Loader2,
  Key,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    loginWithGoogle, 
    loginWithEmail,
    signupWithEmail,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    authError, 
    clearAuthError,
    isLoggingIn,
    modalView,
    setModalView,
    pendingEmail,
    setPendingEmail,
    pendingPurpose,
    setPendingPurpose,
    config
  } = useAuth();

  // Resolved reCAPTCHA Site Key from Vite client env or server config
  const resolvedSiteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY || config?.recaptcha?.siteKey || '';

  // Local form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 6-digit OTP boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password reset fields
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Local UI messaging
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Dynamically load Google reCAPTCHA script if site key is configured
  useEffect(() => {
    if (!resolvedSiteKey || typeof window === 'undefined') return;
    const existing = document.getElementById('google-recaptcha-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-recaptcha-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(resolvedSiteKey)}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [resolvedSiteKey]);

  // Sync email into pendingEmail when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      if (pendingEmail && !email) {
        setEmail(pendingEmail);
      }
      setLocalMessage(null);
      clearAuthError();
    }
  }, [isLoginModalOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isLoginModalOpen) return null;

  // Execute reCAPTCHA if configured
  const getRecaptchaToken = async (action: string = 'auth'): Promise<string | undefined> => {
    if (!resolvedSiteKey) return undefined;
    try {
      const grecaptcha = (window as any).grecaptcha;
      if (!grecaptcha || typeof grecaptcha.execute !== 'function') return undefined;
      return await new Promise<string | undefined>((resolve) => {
        grecaptcha.ready(async () => {
          try {
            const token = await grecaptcha.execute(resolvedSiteKey, { action });
            resolve(token);
          } catch (err) {
            console.warn('reCAPTCHA execution error:', err);
            resolve(undefined);
          }
        });
      });
    } catch {
      return undefined;
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);
    const focusIndex = Math.min(pasteData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Submit handlers
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    clearAuthError();
    const token = await getRecaptchaToken('login');
    const res = await loginWithEmail(email, password, token);
    if (res.requiresVerification) {
      setResendCooldown(60);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    clearAuthError();

    if (password !== confirmPassword) {
      alert('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      alert('Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.');
      return;
    }

    const token = await getRecaptchaToken('signup');
    const res = await signupWithEmail(email, password, displayName, token);
    if (res.success) {
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    clearAuthError();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      return;
    }
    const token = await getRecaptchaToken('verify_otp');
    const res = await verifyOtp(fullCode, token);
    if (res.success && pendingPurpose === 'password_reset') {
      setResetCode(fullCode);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLocalMessage(null);
    clearAuthError();
    const token = await getRecaptchaToken('resend_otp');
    const res = await resendOtp(token);
    if (res.success) {
      setResendCooldown(60);
      setLocalMessage('A fresh verification code has been dispatched to your email.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    clearAuthError();
    const targetEmail = email || pendingEmail;
    if (!targetEmail) return;
    const token = await getRecaptchaToken('forgot_password');
    const res = await forgotPassword(targetEmail, token);
    if (res.success) {
      setResendCooldown(60);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    clearAuthError();

    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match. Please verify your entries.');
      return;
    }

    const codeToUse = resetCode || otpDigits.join('');
    const token = await getRecaptchaToken('reset_password');
    const res = await resetPassword(codeToUse, newPassword, token);
    if (res.success) {
      setLocalMessage('Password successfully updated! You are now logged in.');
    }
  };

  const isEnvError = Boolean(
    authError && (
      authError.includes('GOOGLE_CLIENT_ID') || 
      authError.includes('GOOGLE_CLIENT_SECRET') || 
      authError.includes('DATABASE_URL') ||
      authError.includes('environment variable')
    )
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={closeLoginModal}
    >
      <div 
        className="relative w-full max-w-md my-auto rounded-3xl bg-[#0f1320] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Brand Badge */}
        <div className="space-y-1.5 pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kiran AI Studio Account</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {modalView === 'signin' && 'Sign In to Your Workspace'}
            {modalView === 'signup' && 'Create Your Creator Account'}
            {modalView === 'otp' && 'Verify Your Email'}
            {modalView === 'forgot-password' && 'Reset Account Password'}
            {modalView === 'reset-password' && 'Set New Password'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400">
            {modalView === 'signin' && 'Access all video generation tools, timeline planners, and saved projects.'}
            {modalView === 'signup' && 'Join Kiran AI Video Studio with email and password or Google.'}
            {modalView === 'otp' && `Enter the 6-digit code sent to ${pendingEmail || 'your email'}.`}
            {modalView === 'forgot-password' && 'Enter your email to receive a 6-digit recovery code.'}
            {modalView === 'reset-password' && 'Create a strong new password for your account.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs text-rose-300">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="font-semibold text-rose-200">Authentication Notice</div>
                <p className="break-words leading-relaxed">{authError}</p>
              </div>
            </div>

            {isEnvError && (
              <div className="mt-1 pt-2 border-t border-rose-500/20 text-[11px] text-slate-300 space-y-1 bg-black/40 p-2 rounded-xl">
                <div className="font-semibold text-cyan-300 flex items-center gap-1">
                  <Key className="w-3 h-3 text-cyan-400" />
                  <span>Required Environment Variables:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 font-mono text-[10px]">
                  <li><span className="text-amber-300">GOOGLE_CLIENT_ID</span>: Web Client ID</li>
                  <li><span className="text-amber-300">GOOGLE_CLIENT_SECRET</span>: Web Client Secret</li>
                  <li><span className="text-amber-300">DATABASE_URL</span>: Neon PostgreSQL Connection</li>
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-0.5">
              <button 
                type="button" 
                onClick={clearAuthError}
                className="text-[11px] font-medium underline text-rose-400 hover:text-rose-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Local Success Message */}
        {localMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <p className="flex-1">{localMessage}</p>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: SIGN IN */}
        {/* ---------------------------------------------------- */}
        {modalView === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full bg-[#161a29] text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPendingEmail(email);
                    setPendingPurpose('password_reset');
                    setModalView('forgot-password');
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#161a29] text-white pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Or</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Switch to Signup */}
            <p className="text-center text-xs text-slate-400 pt-2">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setModalView('signup');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Sign Up for Free
              </button>
            </p>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: SIGN UP */}
        {/* ---------------------------------------------------- */}
        {modalView === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Name or Channel Name</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Kiran Chaulagain"
                className="w-full bg-[#161a29] text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full bg-[#161a29] text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Password (Min 8 chars, uppercase, lowercase, number)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-[#161a29] text-white pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-[#161a29] text-white pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 mt-1 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-1.5 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Or</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign Up with Google</span>
            </button>

            {/* Switch to Sign In */}
            <p className="text-center text-xs text-slate-400 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setModalView('signin');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: 6-DIGIT EMAIL OTP VERIFICATION */}
        {/* ---------------------------------------------------- */}
        {modalView === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Verification code sent</span>
                <span className="text-slate-400 text-[11px] font-mono">{pendingEmail || email}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalView('signup')}
                className="text-[11px] text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 6 Digit Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block text-center">
                Enter 6-Digit Verification Code
              </label>

              <div className="flex items-center justify-between gap-2 max-w-xs mx-auto">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 text-center text-xl font-bold font-mono bg-[#161a29] text-cyan-300 rounded-xl border border-white/20 focus:border-cyan-400 focus:bg-cyan-950/20 focus:outline-none transition-all shadow-inner"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>⏱️ Valid for 10 minutes</span>
                <span>One-time secure code</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || otpDigits.join('').length !== 6}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify Email & Enter Studio</span>
                </>
              )}
            </button>

            {/* Resend Cooldown and Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setModalView('signin')}
                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleResendOtp}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1.5 cursor-pointer disabled:text-slate-500 disabled:no-underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'text-cyan-400'}`} />
                <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: FORGOT PASSWORD */}
        {/* ---------------------------------------------------- */}
        {modalView === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Registered Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email || pendingEmail}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setPendingEmail(e.target.value);
                }}
                placeholder="creator@example.com"
                className="w-full bg-[#161a29] text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              We'll send a 6-digit recovery code to this email. You will use the code along with your new password to restore access.
            </p>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Recovery Code...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit Recovery Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setModalView('signin')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 5: RESET PASSWORD */}
        {/* ---------------------------------------------------- */}
        {modalView === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>6-Digit Recovery Code</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 549821"
                className="w-full bg-[#161a29] text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs font-mono tracking-widest transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, number"
                className="w-full bg-[#161a29] text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-[#161a29] text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Update Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setModalView('signin')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Google reCAPTCHA Bot Protection Notice */}
        <div className="pt-2 border-t border-white/5 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
          <span>Protected by Google reCAPTCHA &bull; </span>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline">Privacy</a>
          <span>&bull;</span>
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline">Terms</a>
        </div>
      </div>
    </div>
  );
};
