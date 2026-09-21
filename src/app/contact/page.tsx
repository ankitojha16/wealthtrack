import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact WealthTrack — Track Your Money. Understand Your Wealth.',
  description: 'Contact WealthTrack for feedback, product questions, and support. Founded by ANKIT KUMAR.',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="rounded-[28px] border border-slate-200/80 bg-white dark:bg-slate-900 shadow-sm p-8 sm:p-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
          <MessageSquare className="w-3.5 h-3.5" />
          Contact
        </div>

        <h1 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Get in touch with WealthTrack
        </h1>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          We’re building simpler personal finance tools for people who want to track spending, understand wealth,
          and make better decisions without the clutter. Send feedback, ideas, or product questions.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Email</div>
              <a href="mailto:ankit.ojha1666@gmail.com" className="text-sm font-bold text-slate-900 dark:text-white hover:text-sky-600">
                ankit.ojha1666@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            About WealthTrack
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/feedback" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-sm shadow-sky-600/30">
            Send feedback
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
