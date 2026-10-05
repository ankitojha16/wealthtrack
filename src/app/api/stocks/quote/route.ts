import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || '').trim().toUpperCase();
  const exchange = (searchParams.get('exchange') || 'NSE').trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }

  // TejHQ base URL is configured server-side; the OHLCV endpoint is keyless.
  const apiBaseUrl = process.env.TEJHQ_BASE_URL?.trim().replace(/\/+$/, '');

  if (!apiBaseUrl) {
    return NextResponse.json({
      symbol,
      exchange,
      status: 'unconfigured',
      provider: 'TejHQ',
      message: 'TejHQ base URL is not configured. Set TEJHQ_BASE_URL in the environment.',
    });
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/v1/ohlcv/${encodeURIComponent(exchange.toLowerCase())}/${encodeURIComponent(symbol)}`,
      {
        headers: {
          Accept: 'application/json',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.warn(`[TejHQ] Stock quote request failed with HTTP ${response.status}`);
      return NextResponse.json({
        symbol,
        exchange,
        status: 'unavailable',
        provider: 'TejHQ',
        message: `TejHQ returned HTTP ${response.status}. Check the API key and base URL.`,
      });
    }

    const data = await response.json();
    const rows: Record<string, unknown>[] = Array.isArray(data)
      ? data as Record<string, unknown>[]
      : Array.isArray(data.data) ? data.data as Record<string, unknown>[] : [];
    const fallbackQuote = (data.quote ?? data) as Record<string, unknown>;
    const quote = rows.reduce<Record<string, unknown> | null>((latest, row) => {
      return !latest || String(row.date ?? '') > String(latest.date ?? '') ? row : latest;
    }, null) ?? fallbackQuote;
    const price = [quote.last, quote.close, quote.price, quote.currentPrice, quote.lastPrice, quote.ltp]
      .map(Number)
      .find((value) => Number.isFinite(value) && value > 0) ?? 0;
    const previousClose = Number(quote.prev_close ?? quote.prevClose);
    const change = quote.change ?? quote.priceChange ?? (previousClose > 0 ? price - previousClose : null);
    const changePercent = quote.changePercent ?? quote.pChange ??
      (previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : null);

    if (price > 0) {
      return NextResponse.json({
        symbol,
        exchange,
        price,
        change,
        changePercent,
        lastUpdated: quote.date ? `${quote.date}T00:00:00.000Z` : new Date().toISOString(),
        provider: 'TejHQ EOD',
        status: 'success',
      });
    }

    return NextResponse.json({
      symbol,
      exchange,
      status: 'unavailable',
      provider: 'TejHQ',
      message: 'TejHQ responded, but its quote did not include a valid price.',
    });
  } catch (error) {
    console.warn('[TejHQ] Stock quote proxy error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      symbol,
      exchange,
      status: 'unavailable',
      provider: 'TejHQ',
      message: 'Could not reach TejHQ. Check the base URL and network connection.',
    });
  }
}
