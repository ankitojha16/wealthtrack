'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, Clock } from 'lucide-react';

interface DataPoint {
  label: string; // e.g., 'Aug 2026'
  value: number;
}

interface LineTrendChartProps {
  data: DataPoint[];
  currencySymbol?: string;
  height?: number;
  emptyMessage?: string;
  onRecordSnapshot?: () => void;
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({
  data,
  currencySymbol = '₹',
  height = 240,
  emptyMessage = 'No historical data yet. Keep using WealthTrack to build your financial trend.',
  onRecordSnapshot,
}) => {
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 min-h-[220px]">
        <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-500 mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Authentic Trend Tracking</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">{emptyMessage}</p>
        {onRecordSnapshot && (
          <button
            type="button"
            onClick={onRecordSnapshot}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Record Current Month Snapshot
          </button>
        )}
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * graphWidth;
    const y = height - paddingY - ((d.value - minVal) / range) * graphHeight;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-slate-200 dark:text-slate-800"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-slate-200 dark:text-slate-800"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive circles */}
          {points.map((pt, i) => (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setActivePoint(pt)} onMouseLeave={() => setActivePoint(null)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activePoint?.label === pt.label ? 6 : 4}
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth="2.5"
                className="transition-all"
              />
              <text
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 dark:fill-slate-500 font-medium select-none"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip display */}
        {activePoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg shadow-lg pointer-events-none transition-all">
            {activePoint.label}: {formatCurrency(activePoint.value, { symbol: currencySymbol })}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
        <span>Min: {formatCurrency(minVal, { symbol: currencySymbol, compact: true })}</span>
        <span>Max: {formatCurrency(maxVal, { symbol: currencySymbol, compact: true })}</span>
      </div>
    </div>
  );
};
