'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFinance } from '@/lib/context/FinanceContext';
import { hasSupabaseConfig } from '@/lib/supabase/client';
import { signInLocal, signUpLocal } from '@/lib/auth/localAuth';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { validateSignupCredentials } from '@/lib/auth/localAuth';

export function AuthScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, settings, updateSettings } = useFinance();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const accentClasses = {
    sky: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30',
    violet: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30',
  } as const;

  const accentLabel = settings.accentColor ? settings.accentColor.charAt(0).toUpperCase() + settings.accentColor.slice(1) : 'Sky';

  const accentOptions = [
    { value: 'sky', swatch: 'bg-sky-500' },
    { value: 'violet', swatch: 'bg-violet-500' },
    { value: 'emerald', swatch: 'bg-emerald-500' },
    { value: 'rose', swatch: 'bg-rose-500' },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      const validation = validateSignupCredentials(email.trim(), password, password);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let result;

      if (!hasSupabaseConfig()) {
        result = mode === 'login'
          ? signInLocal(email.trim(), password)
          : signUpLocal(email.trim(), password, password);
      } else {
        result = mode === 'login'
          ? await signInWithEmail(email.trim(), password)
          : await signUpWithEmail(email.trim(), password);
      }

      if (!result) {
        setError(mode === 'login' ? 'Invalid email or password.' : 'Unable to create account. Please try again.');
        return;
      }

      setSuccess(mode === 'login' ? 'Signed in successfully.' : 'Account created. You can now continue.');
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first to receive a password reset link.');
      return;
    }

    if (!hasSupabaseConfig()) {
      setError('Password reset is available only when Supabase auth is enabled in the app configuration.');
      return;
    }

    try {
      const { resetPasswordForEmail } = await import('@/lib/supabase/repository');
      await resetPasswordForEmail(email.trim());
      setSuccess('Password reset email sent. Check your inbox and follow the reset link.');
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset email.');
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
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Secure personal finance tracking for your money, goals, investments and debt.
            </p>
          </div>

          {!hasSupabaseConfig() && (
            <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
              Local-only mode is active right now. The signup form is visible here, and live secure auth will start once Supabase is configured.
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${mode === 'login' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${mode === 'signup' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

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

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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


            <div className="flex items-center justify-between text-[11px]">
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Forgot password?
                </button>
              ) : (
                <span />
              )}
              <span className="text-slate-400">Secure sync enabled</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${accentClasses[settings.accentColor || 'sky']}`}
            >
              {isSubmitting ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : mode === 'login' ? 'Login to WealthTrack' : 'Create account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2"><KeyRound className="w-3.5 h-3.5 text-sky-500" /> <span>Password reset and secure login are enabled for saved financial records.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
