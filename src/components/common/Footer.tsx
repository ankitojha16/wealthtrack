'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-12 pb-24 lg:pb-12 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-100 dark:border-slate-800">
          {/* Brand & Vision */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-sm">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Wealth<span className="text-sky-600 dark:text-sky-400">Track</span>
              </span>
            </Link>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Track Your Money. Understand Your Wealth.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Your personal finance companion for tracking money, goals, investments, loans and financial health. Built
              with a zero-API, privacy-first architecture where your data stays on your device.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Local Storage • Zero External Tracking</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/budget" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Budget & Expenses
                </Link>
              </li>
              <li>
                <Link href="/investments" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Investments
                </Link>
              </li>
              <li>
                <Link href="/goals" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Financial Goals
                </Link>
              </li>
              <li>
                <Link href="/loans" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Loan Tracker
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Financial Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Resources & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/calculators" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Financial Calculators
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Learn Knowledge Base
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  About WealthTrack
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-sky-600 dark:hover:text-white transition-colors">
                  Feedback & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Mandatory Founder Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© 2026 WealthTrack. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="font-bold text-slate-900 dark:text-white">
              Founded by <span className="text-sky-600 dark:text-sky-400">ANKIT KUMAR</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/feedback" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Feedback
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
