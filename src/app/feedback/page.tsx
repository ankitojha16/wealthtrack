'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Mail, Sparkles } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { SUPPORT_EMAIL } from '@/lib/constants';

export default function FeedbackPage() {
  const { settings } = useFinance();
  const [category, setCategory] = useState<
    'Bug Report' | 'Feature Request' | 'UI/Design Feedback' | 'Question' | 'General Feedback'
  >('General Feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const emailToUse = settings.supportEmail || SUPPORT_EMAIL;
    const subject = encodeURIComponent(`[WealthTrack Feedback - ${category}]`);
    const body = encodeURIComponent(
      `Feedback Category: ${category}\n\nMessage:\n${message.trim()}\n\n---\nSent via WealthTrack Web Application\nFounded by ANKIT KUMAR`
    );

    // Open mail client
    window.location.href = `mailto:${emailToUse}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto mb-2">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Send Product Feedback
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Share your suggestions, report issues, or ask questions directly to founder ANKIT KUMAR.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Client Triggered</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your default email client has been prepared with your feedback directed to{' '}
              <strong className="text-slate-800 dark:text-slate-200">{settings.supportEmail || SUPPORT_EMAIL}</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setMessage('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="UI/Design Feedback">UI / Design Feedback</option>
                <option value="Question">Question</option>
                <option value="General Feedback">General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Message / Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your feedback, suggestion, or encountered bug in detail..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 leading-relaxed"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-500 shrink-0" />
              <span>
                Configured Support Recipient: <strong>{settings.supportEmail || SUPPORT_EMAIL}</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Compose Feedback Email</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
