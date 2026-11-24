'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { QuickAddModal } from '../dashboard/QuickAddModal';
import { CommandPalette } from './CommandPalette';
import { PwaRegister } from '../pwa/PwaRegister';
import { useFinance } from '@/lib/context/FinanceContext';
import { hasSupabaseConfig } from '@/lib/supabase/client';

const PROTECTED_ROUTES = [
  '/',
  '/dashboard',
  '/budget',
  '/investments',
  '/goals',
  '/loans',
  '/reports',
  '/settings',
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, authReady } = useFinance();

  const isProtected = PROTECTED_ROUTES.includes(pathname);

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (hasSupabaseConfig() && authReady && !user && isProtected) {
      router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authReady, user, isProtected, pathname, router]);

  if (pathname === '/auth') {
    return <>{children}</>;
  }

  if (hasSupabaseConfig() && isProtected && (!authReady || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PwaRegister />
      <Navbar
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
      <main className="flex-1 pb-28 sm:pb-24 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav />
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />
    </div>
  );
};
