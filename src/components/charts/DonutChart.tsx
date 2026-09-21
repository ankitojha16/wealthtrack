'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/formatters';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  currencySymbol?: string;
  size?: number;
  innerRadius?: number;
  emptyMessage?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  currencySymbol = '₹',
  size = 220,
  innerRadius = 70,
  emptyMessage = 'No data recorded yet',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredData = data.filter((d) => d.value > 0);
  const total = filteredData.reduce((sum, d) => sum + d.value, 0);

  if (filteredData.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-dashed mb-3 animate-pulse" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  const radius = size / 2;
  const strokeWidth = radius - innerRadius;
  const circumference = 2 * Math.PI * ((radius + innerRadius) / 2);

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {filteredData.map((item, index) => {
            const percent = (item.value / total) * 100;
            const strokeDasharray = `${(percent * circumference) / 100} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent * circumference) / 100);
            accumulatedPercent += percent;

            const isHovered = hoveredIndex === index;

            return (
              <circle
                key={item.label}
                cx={radius}
                cy={radius}
                r={(radius + innerRadius) / 2}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
          {hoveredIndex !== null && filteredData[hoveredIndex] ? (
            <>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {filteredData[hoveredIndex].label}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(filteredData[hoveredIndex].value, { symbol: currencySymbol, compact: true })}
              </span>
              <span className="text-xs text-sky-500 font-medium">
                {((filteredData[hoveredIndex].value / total) * 100).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium text-slate-400">Total</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(total, { symbol: currencySymbol, compact: true })}
              </span>
              <span className="text-xs text-slate-500">{filteredData.length} items</span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-2 max-w-xs w-full">
        {filteredData.map((item, index) => {
          const percent = ((item.value / total) * 100).toFixed(1);
          const isHovered = hoveredIndex === index;

          return (
            <button
              type="button"
              key={item.label}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between text-left p-1.5 rounded-lg transition-colors ${
                isHovered ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 pl-2 shrink-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(item.value, { symbol: currencySymbol, compact: true })}
                </span>
                <span className="text-xs text-slate-400 w-10 text-right">{percent}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
