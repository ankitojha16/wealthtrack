import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Lock, HardDrive, Download, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — WealthTrack',
  description: 'WealthTrack privacy architecture: 100% browser-local storage with zero external financial APIs.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-fade-in text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Privacy Policy & Data Sovereign Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Your Money Data Belongs to You
        </h1>
        <p className="text-xs text-slate-400">Last updated: September 2026 • WealthTrack</p>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
        &quot;Your financial data is stored locally on your device in the current version. WealthTrack does not transmit,
        inspect, or sell your financial figures to external servers or third-party market aggregators.&quot;
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white">1. Local-First Browser Storage</h2>
        <p>
          WealthTrack persists your records (including transactions, manual investment balances, goal milestones, loan
          details, and balance sheet assets) inside your personal web browser using client-side IndexedDB technology. No
          cloud databases or remote logging systems receive your confidential figures.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white">2. Zero External Market / Banking APIs</h2>
        <p>
          Unlike legacy fintech trackers that mandate linking bank credentials or scrape emails, WealthTrack is 100%
          API-free. All valuations are user-entered and timestamped by you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white">3. Data Export & Permanent Erasure</h2>
        <p>
          You retain complete ownership of your data at all times. From the Settings tab, you can download a full
          JSON database backup or export individual CSV spreadsheets. You may also execute a permanent wipe of all
          locally stored records whenever you choose.
        </p>
      </section>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
        Founded by ANKIT KUMAR • WealthTrack Personal Finance Management
      </div>
    </div>
  );
}
