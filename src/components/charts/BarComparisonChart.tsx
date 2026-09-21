'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface BarComparisonChartProps {
  items: BarItem[];
  currencySymbol?: string;
  height?: number;
}

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  items,
  currencySymbol = '₹',
}) => {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex flex-col gap-4 w-full">
      {items.map((item) => {
        const percentage = Math.min(100, Math.max(0, (item.value / maxValue) * 100));

        return (
          <div key={item.label} className="w-full">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
              <span className="text-slate-900 dark:text-white font-bold">
                {formatCurrency(item.value, { symbol: currencySymbol, compact: true })}
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
