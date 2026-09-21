import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || '').trim().toUpperCase();
  const exchange = (searchParams.get('exchange') || 'NSE').trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }

  // TejHQ credentials — configured via environment variables (never exposed to frontend)
  const apiKey = process.env.TEJHQ_API_KEY;
  const apiBaseUrl = process.env.TEJHQ_BASE_URL;

  if (apiKey && apiBaseUrl) {
    try {
      const response = await fetch(
        `${apiBaseUrl}/quote?symbol=${encodeURIComponent(symbol)}&exchange=${encodeURIComponent(exchange)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
          next: { revalidate: 300 }, // 5-minute server-side cache
        }
      );

      if (response.ok) {
        const data = await response.json();
        const price = data.price ?? data.currentPrice ?? data.lastPrice ?? data.ltp ?? null;

        if (typeof price === 'number' && price > 0) {
          return NextResponse.json({
            symbol,
            exchange,
            price,
            change: data.change ?? data.priceChange ?? null,
            changePercent: data.changePercent ?? data.pChange ?? null,
            lastUpdated: new Date().toISOString(),
            provider: 'TejHQ',
            status: 'success',
          });
        }
      }
    } catch (err) {
      console.warn('[TejHQ] Stock quote proxy error:', err);
    }
  }

  // Graceful fallback — never expose ₹0 or fake values
  return NextResponse.json({
    symbol,
    exchange,
    status: 'unconfigured',
    provider: 'TejHQ',
    message:
      'TejHQ API credentials not yet configured. Set TEJHQ_API_KEY and TEJHQ_BASE_URL environment variables.',
  });
}
