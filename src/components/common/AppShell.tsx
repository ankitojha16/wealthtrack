'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { QuickAddModal } from '../dashboard/QuickAddModal';
import { CommandPalette } from './CommandPalette';
import { PwaRegister } from '../pwa/PwaRegister';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, authReady, settings, updateSettings } = useFinance();

  const isProtected = PROTECTED_ROUTES.includes(pathname);

  // Global keyboard shortcuts & hotkey sequences
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always allow Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ignore single-key shortcuts when typing inside form controls
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl && activeEl.getAttribute('contenteditable') === 'true');

      if (isInput) return;

      const now = Date.now();
      const key = e.key.toLowerCase();

      // '?' opens shortcuts cheat sheet
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Quick Add shortcut: 'a'
      if (key === 'a' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsQuickAddOpen(true);
        return;
      }

      // Toggle theme shortcut: 't'
      if (key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
        return;
      }

      // Go-To sequences: 'g' then <key> within 1000ms
      if (lastKey === 'g' && now - lastKeyTime < 1000) {
        const routeMap: Record<string, string> = {
          d: '/',
          b: '/budget',
          i: '/investments',
          g: '/goals',
          l: '/loans',
          r: '/reports',
          c: '/calculators',
          f: '/tools/fire-simulator',
          s: '/settings',
        };

        if (routeMap[key]) {
          e.preventDefault();
          router.push(routeMap[key]);
          lastKey = '';
          return;
        }
      }

      lastKey = key;
      lastKeyTime = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, settings.theme, updateSettings]);

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
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
