'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFinance } from '@/lib/context/FinanceContext';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { validateSignupCredentials } from '@/lib/auth/localAuth';
import { sanitizeRedirectUrl } from '@/lib/auth/redirect';

export function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectDestination = sanitizeRedirectUrl(searchParams?.get('redirect'));
  const { signInWithEmail, signUpWithEmail, resetPasswordForEmail, settings } = useFinance();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAuthCoolingDown = cooldownUntil !== null && Date.now() < cooldownUntil;

  useEffect(() => {
    if (cooldownUntil === null) return;

    const timeout = window.setTimeout(() => setCooldownUntil(null), Math.max(0, cooldownUntil - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [cooldownUntil]);

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

      setSuccess(mode === 'login' ? 'Signed in successfully.' : 'Account created! Signing you in...');
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-900/5 dark:shadow-black/20 p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white ring-1 ring-sky-100 dark:ring-slate-800 shadow-lg shadow-sky-500/20">
              <Image src="/favicon.svg" alt="WealthTrack logo" width={64} height={64} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
              <Sparkles className="w-3 h-3" />
              WealthTrack
            </div>
            <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
            </h1>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'forgot'
                ? 'Enter your registered email to receive a verified password recovery link.'
                : 'Secure personal finance tracking for your money, goals, investments and debt.'}
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password (min. 8 characters)"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            )}

            {mode === 'forgot' && (
              <div className="flex items-center justify-end text-xs pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="text-slate-500 hover:underline"
                >
                  Back to login
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Forgot password?
                </button>
              ) : (
                <span />
              )}
              <span className="text-slate-400">
                {hasSupabaseConfig() ? 'Secure cloud sync enabled' : 'Saved on this device only'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isAuthCoolingDown}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${accentClasses[settings.accentColor || 'sky']}`}
            >
              {isSubmitting
                ? (mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending reset link...')
                : isAuthCoolingDown
                  ? 'Try again soon'
                  : mode === 'login'
                    ? 'Login to WealthTrack'
                    : mode === 'signup'
                      ? 'Create account'
                      : 'Send Verified Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-sky-500" />
              <span>
                {hasSupabaseConfig()
                  ? 'Verified email recovery and Supabase Auth encryption protect your account.'
                  : 'Your account and financial data are stored securely on this device.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
