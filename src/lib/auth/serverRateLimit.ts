type RateLimitEntry = { count: number; resetAt: number };
type RateLimitGlobal = typeof globalThis & { wealthTrackRateLimits?: Map<string, RateLimitEntry> };

const globalStore = globalThis as RateLimitGlobal;
const rateLimits = globalStore.wealthTrackRateLimits ??= new Map<string, RateLimitEntry>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count += 1;
  return false;
}