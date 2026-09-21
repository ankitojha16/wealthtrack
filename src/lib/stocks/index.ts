export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}

export interface StockQuote {
  symbol: string;
  exchange: string;
  price: number;
  change?: number;
  changePercent?: number;
  lastUpdated: string;
  source: 'api' | 'manual';
  provider?: string;
  status: 'success' | 'failed' | 'unavailable';
}

// In-memory quote cache with 5-minute TTL to prevent rate limit exhaustion
interface CacheEntry {
  quote: StockQuote;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch live stock quote via server proxy
 */
export async function fetchStockQuote(symbol: string, exchange = 'NSE'): Promise<StockQuote> {
  const cacheKey = `${symbol.toUpperCase()}:${exchange.toUpperCase()}`;
  const cached = quoteCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.quote;
  }

  try {
    const res = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(symbol)}&exchange=${encodeURIComponent(exchange)}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data && typeof data.price === 'number' && data.price > 0) {
      const quote: StockQuote = {
        symbol: data.symbol || symbol,
        exchange: data.exchange || exchange,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        lastUpdated: data.lastUpdated || new Date().toLocaleTimeString(),
        source: 'api',
        provider: data.provider || 'Configured Stock API',
        status: 'success',
      };

      quoteCache.set(cacheKey, { quote, timestamp: Date.now() });
      return quote;
    }

    return {
      symbol,
      exchange,
      price: cached ? cached.quote.price : 0,
      lastUpdated: new Date().toLocaleTimeString(),
      source: 'api',
      status: 'unavailable',
    };
  } catch (err) {
    console.warn(`Stock quote unavailable for ${symbol}:`, err);
    return {
      symbol,
      exchange,
      price: cached ? cached.quote.price : 0,
      lastUpdated: new Date().toLocaleTimeString(),
      source: 'api',
      status: 'unavailable',
    };
  }
}

/**
 * Search stocks by company name or ticker symbol via server proxy
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.trim().length < 1) return [];

  try {
    const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch (err) {
    console.warn('Stock search request failed:', err);
    return [];
  }
}
