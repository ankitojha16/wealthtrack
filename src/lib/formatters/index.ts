/**
 * Format numbers with Indian numbering system (Lakhs and Crores)
 * e.g., 100000 -> 1,00,000
 */
export function formatIndianNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return '0';
  const isNegative = num < 0;
  const absVal = Math.abs(Math.round(num * 100) / 100);
  const parts = absVal.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  if (integerPart.length <= 3) {
    return (isNegative ? '-' : '') + integerPart + decimalPart;
  }

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  return (isNegative ? '-' : '') + formattedOther + ',' + lastThree + decimalPart;
}

/**
 * Format currency with symbol and system preference
 */
export function formatCurrency(
  amount: number,
  options: {
    symbol?: string;
    format?: 'indian' | 'international';
    decimals?: number;
    compact?: boolean;
  } = {}
): string {
  const symbol = options.symbol ?? '₹';
  const format = options.format ?? 'indian';
  const decimals = options.decimals ?? 0;
  const compact = options.compact ?? false;

  if (isNaN(amount) || !isFinite(amount)) {
    return `${symbol}0`;
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact) {
    if (format === 'indian') {
      if (absAmount >= 10000000) {
        // Crores
        const cr = absAmount / 10000000;
        return `${isNegative ? '-' : ''}${symbol}${cr.toFixed(2).replace(/\.?0+$/, '')}Cr`;
      } else if (absAmount >= 100000) {
        // Lakhs
        const lk = absAmount / 100000;
        return `${isNegative ? '-' : ''}${symbol}${lk.toFixed(2).replace(/\.?0+$/, '')}L`;
      } else if (absAmount >= 1000) {
        const k = absAmount / 1000;
        return `${isNegative ? '-' : ''}${symbol}${k.toFixed(1).replace(/\.?0+$/, '')}k`;
      }
    } else {
      if (absAmount >= 1000000000) {
        return `${isNegative ? '-' : ''}${symbol}${(absAmount / 1000000000).toFixed(1)}B`;
      } else if (absAmount >= 1000000) {
        return `${isNegative ? '-' : ''}${symbol}${(absAmount / 1000000).toFixed(1)}M`;
      } else if (absAmount >= 1000) {
        return `${isNegative ? '-' : ''}${symbol}${(absAmount / 1000).toFixed(1)}k`;
      }
    }
  }

  let formattedNum = '';
  if (format === 'indian') {
    const fixedNum = absAmount.toFixed(decimals);
    const [intPart, decPart] = fixedNum.split('.');
    let result = '';
    if (intPart.length <= 3) {
      result = intPart;
    } else {
      const lastThree = intPart.substring(intPart.length - 3);
      const others = intPart.substring(0, intPart.length - 3);
      result = others.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    formattedNum = decPart ? `${result}.${decPart}` : result;
  } else {
    formattedNum = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return `${isNegative ? '-' : ''}${symbol}${formattedNum}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2, showSign: boolean = false): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format date nicely e.g. "21 Sep 2026"
 */
export function formatDate(dateString: string | number): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format Month & Year e.g. "September 2026"
 */
export function formatMonthYear(dateString: string | number): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get current date in YYYY-MM-DD
 */
export function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month in YYYY-MM
 */
export function getCurrentMonthYearString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
