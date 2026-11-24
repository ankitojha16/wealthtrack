'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFinance } from '@/lib/context/FinanceContext';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Check,
  X,
  PlayCircle,
  Laptop,
} from 'lucide-react';
import { validateSignupCredentials } from '@/lib/auth/localAuth';
import { sanitizeRedirectUrl } from '@/lib/auth/redirect';

const REMEMBERED_EMAIL_KEY = 'wealthtrack_remembered_email';

export function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectDestination = sanitizeRedirectUrl(searchParams?.get('redirect'));
  const initialMode = searchParams?.get('mode') === 'signup' ? 'signup' : 'login';

  const {
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
    continueAsGuest,
    user,
    authReady,
    settings,
  } = useFinance();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestEntering, setIsGuestEntering] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (authReady && user) {
      router.replace(redirectDestination);
    }
  }, [authReady, user, redirectDestination, router]);

  // Load remembered email on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    }
  }, []);

  const handleContinueAsGuest = async (withSampleData: boolean = false) => {
    setIsGuestEntering(true);
    setError('');
    try {
      await continueAsGuest(withSampleData);
      router.push(redirectDestination);
    } catch (err: any) {
      setError(err?.message || 'Failed to start guest session.');
    } finally {
      setIsGuestEntering(false);
    }
  };

  const isAuthCoolingDown = cooldownUntil !== null && Date.now() < cooldownUntil;

  useEffect(() => {
    if (cooldownUntil === null) return;

    const timeout = window.setTimeout(() => setCooldownUntil(null), Math.max(0, cooldownUntil - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [cooldownUntil]);

  // Password strength checklist & score calculation
  const passChecks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const strengthScore = [
    passChecks.length,
    passChecks.hasNumber,
    passChecks.hasUpper,
    passChecks.hasSpecial,
  ].filter(Boolean).length;

  const strengthMeta = [
    { label: 'Very Weak', color: 'bg-rose-500', text: 'text-rose-500' },
    { label: 'Weak', color: 'bg-rose-400', text: 'text-rose-400' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Good', color: 'bg-sky-500', text: 'text-sky-500' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' },
  ][strengthScore];

  const accentClasses = {
    default: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30',
    green: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
    blue: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30',
    purple: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30',
    sky: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30',
    violet: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30',
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isAuthCoolingDown) {
      const remainingSeconds = Math.ceil((cooldownUntil! - Date.now()) / 1000);
      setError(`Too many attempts. Please wait ${remainingSeconds}s before trying again.`);
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Persist or clear remembered email
    if (typeof window !== 'undefined') {
      if (rememberEmail) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    }

    if (mode === 'forgot') {
      await handlePasswordReset();
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      const validation = validateSignupCredentials(email.trim(), password, confirmPassword);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = mode === 'login'
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password);

      if (!result) {
        setError(mode === 'login' ? 'Invalid email or password.' : 'Unable to create account. Please try again.');
        return;
      }

      setSuccess(mode === 'login' ? 'Signed in successfully! Redirecting...' : 'Account created successfully! Signing you in...');
      router.push(redirectDestination);
    } catch (err: any) {
      const userMessage = err?.message || 'Authentication failed. Please try again.';
      setError(userMessage);

      if (userMessage.toLowerCase().includes('too many attempts') || userMessage.toLowerCase().includes('rate limit') || userMessage.toLowerCase().includes('too many requests')) {
        setCooldownUntil(Date.now() + 30000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setSuccess('');

    if (isAuthCoolingDown) {
      const remainingSeconds = Math.ceil((cooldownUntil! - Date.now()) / 1000);
      setError(`Too many attempts. Please wait ${remainingSeconds}s before trying again.`);
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordForEmail(email.trim());
      setSuccess('Verified password reset link sent! Please check your email inbox to proceed.');
    } catch (err: any) {
      const userMessage = err?.message || 'Unable to reset password.';
      setError(userMessage);

      if (userMessage.toLowerCase().includes('too many attempts') || userMessage.toLowerCase().includes('rate limit') || userMessage.toLowerCase().includes('too many requests')) {
        setCooldownUntil(Date.now() + 30000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4 py-8 sm:py-12 flex items-center justify-center relative overflow-hidden">
      {/* Background ambient light orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-slate-950/30 p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white ring-2 ring-sky-500/20 shadow-lg shadow-sky-500/20 p-2 flex items-center justify-center">
              <Image src="/favicon.svg" alt="WealthTrack logo" width={48} height={48} className="h-full w-full object-contain" priority />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
              <Sparkles className="w-3 h-3 text-sky-500" />
              WealthTrack 2.5
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'forgot'
                ? 'Enter your registered email to receive a secure recovery link.'
                : mode === 'signup'
                ? 'Track your money, investments, goals and debt in one private hub.'
                : 'Sign in to access your balance sheet, budgets and analytics.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-5">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2 animate-fade-in">
              <div className="flex-1">
                <span>{error}</span>
                {error.toLowerCase().includes('already exists') && mode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="block font-bold text-sky-600 dark:text-sky-400 hover:underline mt-1"
                  >
                    Switch to Sign In →
                  </button>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'signup' && password.length > 0 && (
                    <span className={`text-[10px] font-bold ${strengthMeta.text}`}>
                      {strengthMeta.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Create a strong password (min. 8 chars)' : 'Enter your password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter & criteria (for Signup) */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-all ${
                            strengthScore >= step ? strengthMeta.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                      <span className={`inline-flex items-center gap-1 ${passChecks.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {passChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                        8+ characters
                      </span>
                      <span className={`inline-flex items-center gap-1 ${passChecks.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {passChecks.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                        At least 1 number
                      </span>
                      <span className={`inline-flex items-center gap-1 ${passChecks.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {passChecks.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                        Uppercase letter
                      </span>
                      <span className={`inline-flex items-center gap-1 ${passChecks.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {passChecks.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                        Special symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password Field (for Signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                    Passwords do not match yet
                  </span>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              {mode === 'login' ? (
                <>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Remember email</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline text-[11px]"
                  >
                    Forgot password?
                  </button>
                </>
              ) : mode === 'forgot' ? (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-slate-500 hover:underline text-[11px]"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">
                  {hasSupabaseConfig() ? '🔒 Encrypted cloud sync' : '💾 Stored safely on this device'}
                </span>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || isAuthCoolingDown}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-60 ${accentClasses[settings.accentColor || 'sky']}`}
            >
              {isSubmitting ? (
                <span>
                  {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending link...'}
                </span>
              ) : isAuthCoolingDown ? (
                <span>Wait for cooldown</span>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Sign In to WealthTrack'
                      : mode === 'signup'
                      ? 'Create Free Account'
                      : 'Send Verified Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-black tracking-widest text-slate-400">
              Instant Preview Options
            </span>
          </div>

          {/* Quick Demo Options */}
          <div className="space-y-2.5">
            {/* 1-Click Demo with Pre-loaded Sample Portfolio */}
            <button
              type="button"
              onClick={() => handleContinueAsGuest(true)}
              disabled={isSubmitting || isGuestEntering}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-sky-200/80 dark:border-sky-800/80 bg-sky-50/70 hover:bg-sky-100/80 dark:bg-sky-950/40 dark:hover:bg-sky-950/70 text-left transition group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-sky-900 dark:text-sky-200">
                      Explore Demo with Sample Portfolio
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-sky-600 text-white tracking-wider">
                      Popular
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    1-Click instant tour with pre-populated stocks, SIPs, goals, & net worth trends.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Offline Clean-Slate Guest Mode */}
            <button
              type="button"
              onClick={() => handleContinueAsGuest(false)}
              disabled={isSubmitting || isGuestEntering}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>{isGuestEntering ? 'Entering...' : 'Start Fresh (Clean Slate Guest Mode)'}</span>
            </button>
          </div>

          {/* Security & Privacy Badges Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Private & Encrypted
            </span>
            <span>•</span>
            <span>Zero Tracking</span>
            <span>•</span>
            <span>Free Forever</span>
          </div>
        </div>
      </div>
    </div>
  );
}
