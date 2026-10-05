'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { QuickAddModal } from '../dashboard/QuickAddModal';
import { PwaRegister } from '../pwa/PwaRegister';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/auth') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PwaRegister />
      <Navbar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
      <main className="flex-1 pb-28 sm:pb-24 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav />
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
};
