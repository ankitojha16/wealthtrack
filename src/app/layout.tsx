import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { FinanceProvider } from '@/lib/context/FinanceContext';
import { AppShell } from '@/components/common/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://wealthtrack.app'),
  title: 'WealthTrack — Track Your Money. Understand Your Wealth.',
  description:
    'Personal finance management for income, expenses, budgets, investments, goals, loans, net worth, and financial health. Enter less. Understand more.',
  applicationName: 'WealthTrack',
  authors: [{ name: 'ANKIT KUMAR' }],
  generator: 'WealthTrack',
  keywords: [
    'personal finance',
    'wealth tracker',
    'net worth calculator',
    'financial health score',
    'budget manager',
    'loan EMI tracker',
    'manual investment tracking',
    'SIP calculator',
    'EMI calculator',
    'CAGR calculator',
    'XIRR calculator',
    'Ankit Kumar',
  ],
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'WealthTrack — Track Your Money. Understand Your Wealth.',
    description:
      'Track income, expenses, budgets, investments, goals, loans, and net worth with a simple, private financial dashboard.',
    siteName: 'WealthTrack',
    url: 'https://wealthtrack.app',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WealthTrack — Track Your Money. Understand Your Wealth.',
    description: 'Track income, expenses, investments, loans, and net worth with a simple, private financial dashboard.',
    creator: '@WealthTrackApp',
  },
};

export const viewport: Viewport = {
  themeColor: '#06172b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body>
        <FinanceProvider>
          <AppShell>{children}</AppShell>
        </FinanceProvider>
      </body>
    </html>
  );
}
