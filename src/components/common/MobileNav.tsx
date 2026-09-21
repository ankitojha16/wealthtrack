'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PieChart,
  Target,
  CreditCard,
  Menu,
  X,
  TrendingUp,
  FileBarChart2,
  Calculator,
  BookOpen,
  Settings,
  MessageSquare,
  Shield,
  FileText,
  Info,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Budget', href: '/budget', icon: PieChart },
    { label: 'Goals', href: '/goals', icon: Target },
    { label: 'Loans', href: '/loans', icon: CreditCard },
  ];

  const moreItems = [
    { label: 'Login / Sign up', href: '/auth', icon: Settings, desc: 'Access account & secure sync' },
    { label: 'Investments', href: '/investments', icon: TrendingUp, desc: 'Portfolio & returns' },
    { label: 'Reports', href: '/reports', icon: FileBarChart2, desc: 'Net worth & financial health' },
    { label: 'Calculators', href: '/calculators', icon: Calculator, desc: '19 Financial calculators' },
    { label: 'Learn', href: '/learn', icon: BookOpen, desc: 'Guides & knowledge base' },
    { label: 'Settings', href: '/settings', icon: Settings, desc: 'Preferences, currency & data' },
    { label: 'Feedback', href: '/feedback', icon: MessageSquare, desc: 'Contact founder & team' },
    { label: 'Privacy Policy', href: '/privacy', icon: Shield, desc: '100% local storage guarantee' },
    { label: 'Terms of Use', href: '/terms', icon: FileText, desc: 'Product guidelines' },
    { label: 'About WealthTrack', href: '/about', icon: Info, desc: 'Founded by ANKIT KUMAR' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <div className="flex items-center justify-around h-20 px-2 pb-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-1">{tab.label}</span>
              </Link>
            );
          })}

          {/* More Tab Trigger */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isMoreOpen
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </div>

      {/* More Drawer Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Sheet */}
          <div className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">More Options</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">WealthTrack features & legal</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-6">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
                      <span className="text-[11px] text-slate-400">{item.desc}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
