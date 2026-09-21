'use client';

import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  colorClass?: string;
  heightClass?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  colorClass = 'bg-sky-500',
  heightClass = 'h-2.5',
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${colorClass} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>{clamped.toFixed(0)}%</span>
          <span>Target: 100%</span>
        </div>
      )}
    </div>
  );
};
