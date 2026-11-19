/**
 * Validates and sanitizes a redirect destination URL to prevent open redirect vulnerabilities.
 * Ensures that the destination is strictly a safe, relative path within the application.
 */
export function sanitizeRedirectUrl(target: string | null | undefined, fallback: string = '/'): string {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Reject empty string or URLs with control characters
  if (!trimmed || /[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallback;
  }

  // Must begin with a single '/' and not '//' or '/\' (which browsers treat as protocol-relative URLs)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Reject URLs containing javascript:, data:, vbscript:, or protocol schemes
  if (
    trimmed.toLowerCase().includes('javascript:') ||
    trimmed.toLowerCase().includes('data:') ||
    trimmed.toLowerCase().includes('vbscript:') ||
    /^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    return fallback;
  }

  return trimmed;
}
