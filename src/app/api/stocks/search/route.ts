import { NextRequest, NextResponse } from 'next/server';

// Curated NSE/NASDAQ stock catalog for instant offline search
// Used as fallback when TejHQ search API is not yet configured
const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'INFY', name: 'Infosys Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', currency: 'INR' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ITC', name: 'ITC Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', exchange: 'NSE', currency: 'INR' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India', exchange: 'NSE', currency: 'INR' },
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', currency: 'USD' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  // If TejHQ configured, proxy to their search endpoint
  const apiKey = process.env.TEJHQ_API_KEY;
  const apiBaseUrl = process.env.TEJHQ_BASE_URL;

  if (apiKey && apiBaseUrl) {
    try {
      const response = await fetch(
        `${apiBaseUrl}/search?q=${encodeURIComponent(q)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        }
      );
      if (response.ok) {
        const externalData = await response.json();
        // Support both { results: [] } and flat array responses
        const results = Array.isArray(externalData) ? externalData : externalData.results ?? [];
        return NextResponse.json({ results });
      }
    } catch (err) {
      console.warn('[TejHQ] Stock search proxy error:', err);
    }
  }

  // Offline catalog fallback — instant match
  const matched = POPULAR_STOCKS.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  ).slice(0, 10);

  return NextResponse.json({ results: matched });
}
