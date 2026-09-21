'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CALCULATORS } from '@/lib/data/calculators';
import { Calculator, Search, ArrowRight, Sparkles } from 'lucide-react';

export default function CalculatorsCatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Investment', 'Savings', 'General Finance', 'Loan & Debt'];
  const featuredSlugs = new Set(['inflation', 'swp', 'sip', 'lumpsum', 'fd', 'rd']);

  const visibleCalculatorSlugs = new Set(['inflation', 'swp', 'sip', 'lumpsum', 'fd', 'rd']);

  const orderedCalculators = [...CALCULATORS]
    .filter((calc) => visibleCalculatorSlugs.has(calc.slug))
    .sort((a, b) => {
      const aPriority = featuredSlugs.has(a.slug) ? 0 : 1;
      const bPriority = featuredSlugs.has(b.slug) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.title.localeCompare(b.title);
    });

  const filteredCalculators = orderedCalculators.filter((calc) => {
    const matchCategory = selectedCategory === 'All' || calc.category === selectedCategory;
    const query = search.toLowerCase();
    const matchSearch =
      !search ||
      calc.title.toLowerCase().includes(query) ||
      calc.description.toLowerCase().includes(query) ||
      calc.category.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-600 dark:text-sky-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core WealthTools</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Essential Money Calculators
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Quick calculations for SIPs, lumpsum investing, fixed deposits, recurring deposits, and inflation planning.
          Less clutter, more clarity.
        </p>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="max-w-xl mx-auto space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search EMI, SIP, CAGR, XIRR, FD, Prepayment..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {filteredCalculators.map((calc) => (
          <Link
            key={calc.slug}
            href={`/calculators/${calc.slug}`}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  {calc.category}
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-sky-600 group-hover:bg-sky-50 transition-colors">
                  <Calculator className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {calc.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {calc.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
              <span>Calculate Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
