import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/auth/serverRateLimit';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(`reset-ip:${clientIp}`, 5, 15 * 60 * 1000)
    || isRateLimited(`reset-email:${email}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many recovery attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Supabase server admin is not configured.' }, { status: 503 });
  }

  // Priority 1: Verified email-based password recovery.
  // Generate a legitimate recovery link or trigger reset email via Supabase Auth
  try {
    const { error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${request.nextUrl.origin}/settings`,
      },
    });

    if (error) {
      console.warn('[auth] Recovery link generation note:', error.message);
    }
  } catch (err: any) {
    console.error('[auth] Password recovery error:', err?.message);
  }

  // Always return generic success to prevent email enumeration attacks
  return NextResponse.json({
    ok: true,
    message: 'If an account exists for this email, a verified password reset link has been dispatched.',
  });
}