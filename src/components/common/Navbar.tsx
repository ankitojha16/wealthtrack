'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  PieChart,
  TrendingUp,
  Target,
  CreditCard,
  FileBarChart2,
  Calculator,
  BookOpen,
  PlusCircle,
  Moon,
  Sun,
  Settings,
  LogIn,
  LogOut,
  User,
  Search,
  Coins,
} from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';

interface NavbarProps {
  onOpenQuickAdd?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAdd, onOpenCommandPalette }) => {
  const pathname = usePathname();
  const { settings, updateSettings, user, signOutUser } = useFinance();

  const navLinks = [
    { label: 'Dashboard', href: '/', icon: Wallet },
    { label: 'Budget', href: '/budget', icon: PieChart },
    { label: 'Investments', href: '/investments', icon: TrendingUp },
    { label: 'Goals', href: '/goals', icon: Target },
    { label: 'Loans', href: '/loans', icon: CreditCard },
    { label: 'Reports', href: '/reports', icon: FileBarChart2 },
    { label: 'Calculators', href: '/calculators', icon: Calculator },
    { label: 'Learn', href: '/learn', icon: BookOpen },
  ];

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-md shadow-sky-500/20 ring-1 ring-sky-100 dark:ring-slate-800 group-hover:scale-105 transition-transform">
            <Image src="/favicon.svg" alt="WealthTrack logo" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Wealth<span className="text-sky-600 dark:text-sky-400">Track</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline -mt-0.5 tracking-wider uppercase">
              Money & Wealth
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Global Search / Command Palette Shortcut */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition text-xs"
              title="Search and Quick Actions (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Search</span>
              <kbd className="px-1 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500">⌘K</kbd>
            </button>
          )}

          {/* Quick Currency Switcher */}
          <button
            type="button"
            onClick={() => {
              const next = settings.currency === 'INR'
                ? { currency: 'USD', currencySymbol: '$', numberFormat: 'international' as const }
                : settings.currency === 'USD'
                ? { currency: 'EUR', currencySymbol: '€', numberFormat: 'international' as const }
                : settings.currency === 'EUR'
                ? { currency: 'GBP', currencySymbol: '£', numberFormat: 'international' as const }
                : { currency: 'INR', currencySymbol: '₹', numberFormat: 'indian' as const };
              updateSettings(next);
            }}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black transition cursor-pointer"
            title={`Active currency: ${settings.currency} (${settings.currencySymbol}). Click to cycle currency.`}
          >
            <Coins className="w-3 h-3 text-amber-500" />
            <span>{settings.currencySymbol}</span>
            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">{settings.currency}</span>
          </button>

          {/* Quick Add Button */}
          {onOpenQuickAdd && (
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/30 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Record</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            user.isGuest ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-[10px] font-bold">
                  Guest
                </span>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/40 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Exit Guest Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="hidden md:inline text-[11px] font-semibold text-slate-500 dark:text-slate-400 max-w-[140px] truncate" title={user.email ?? ''}>
                  {user.email ?? 'Account'}
                </span>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Link>
          )}

          {/* Settings Link */}
          <Link
            href="/settings"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
