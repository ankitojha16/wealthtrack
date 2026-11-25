'use client';

import React from 'react';
import { Modal } from './Modal';
import { Keyboard, Command, ArrowRight, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  category: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const groups: ShortcutGroup[] = [
    {
      category: 'General & Global',
      items: [
        { keys: ['⌘', 'K'], description: 'Open Command Palette & Global Search' },
        { keys: ['Ctrl', 'K'], description: 'Open Command Palette (Windows/Linux)' },
        { keys: ['?'], description: 'Toggle this Keyboard Shortcuts guide' },
        { keys: ['Esc'], description: 'Close any modal, dialog, or drawer' },
      ],
    },
    {
      category: 'Quick Actions',
      items: [
        { keys: ['A'], description: 'Open Quick Add Record (Transaction / Asset / Goal)' },
        { keys: ['T'], description: 'Toggle Dark / Light Visual Theme' },
      ],
    },
    {
      category: 'Go To Navigation (Press G then...)',
      items: [
        { keys: ['G', 'D'], description: 'Go to Financial Dashboard' },
        { keys: ['G', 'B'], description: 'Go to Budget & Category Allocations' },
        { keys: ['G', 'I'], description: 'Go to Investments & Portfolio' },
        { keys: ['G', 'G'], description: 'Go to Financial Goals Tracker' },
        { keys: ['G', 'L'], description: 'Go to Loans & EMI Amortization' },
        { keys: ['G', 'R'], description: 'Go to Reports & Balance Sheet Audit' },
        { keys: ['G', 'C'], description: 'Go to Financial Calculators Catalog' },
        { keys: ['G', 'F'], description: 'Go to FIRE Retirement Simulator' },
        { keys: ['G', 'S'], description: 'Go to Settings & Data Management' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidthClass="max-w-xl">
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-xs text-sky-700 dark:text-sky-300">
          <Sparkles className="w-4 h-4 shrink-0 text-sky-500" />
          <span>
            Navigate WealthTrack faster with hotkeys. Shortcuts are automatically suspended while typing inside inputs.
          </span>
        </div>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.category}
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {k}
                          </kbd>
                          {kIdx < item.keys.length - 1 && (
                            <span className="text-[10px] text-slate-400">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </Modal>
  );
};
