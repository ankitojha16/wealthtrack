import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Heart, TrendingUp, Sparkles, Lock, Cpu, EyeOff } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About WealthTrack — Track Your Money. Understand Your Wealth.',
  description: 'Learn about WealthTrack: Privacy-first personal finance application founded by ANKIT KUMAR.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-fade-in">
      {/* Brand Hero */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/20">
          <TrendingUp className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Wealth<span className="text-sky-600 dark:text-sky-400">Track</span>
        </h1>
        <p className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          Track Your Money. Understand Your Wealth.
        </p>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          WealthTrack is a personal finance management tool designed to help users understand their income, spending,
          investments, goals, loans, assets, liabilities and overall financial position.
        </p>
      </div>

      {/* Founder Credit Spotlight */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-sky-50 to-white dark:from-slate-900 dark:to-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 shadow-sm text-center space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
          Origin & Leadership
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Founded by <span className="text-sky-600 dark:text-sky-400">ANKIT KUMAR</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Built with an uncompromising vision that modern personal finance tools should be private, reliable, and free
          from predatory bank tracking, third-party data brokerages, and fake market hype.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">
          Our Architectural Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Zero API Dependency</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We never connect to live stock market APIs or banking scrapers. Your investment numbers are maintained by
              you with complete timestamp transparency.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600">
              <EyeOff className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">100% Local Storage</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              All financial ledger entries, goals, loans, and portfolio holdings reside entirely inside your
              browser’s secure IndexedDB. We cannot read your numbers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">No Fake History</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              WealthTrack never fabricates synthetic financial performance or arbitrary health scores. Diagnostics are
              derived strictly from your authentic entries.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 flex justify-center gap-6 text-xs text-slate-500">
        <Link href="/privacy" className="hover:text-sky-600">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-sky-600">Terms of Service</Link>
        <Link href="/feedback" className="hover:text-sky-600">Send Feedback</Link>
        <Link href="/" className="hover:text-sky-600">Back to Dashboard</Link>
      </div>
    </div>
  );
}
