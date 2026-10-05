import { NextRequest, NextResponse } from 'next/server';
import { isRecoveryFruit, normalizeRecoveryFruit } from '@/lib/auth/recovery';
import { isRateLimited } from '@/lib/auth/serverRateLimit';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string; favoriteFruit?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  const favoriteFruit = body.favoriteFruit ?? '';

  if (!email || !email.includes('@') || password.length < 8 || !isRecoveryFruit(favoriteFruit)) {
    return NextResponse.json({ error: 'Enter a valid email, password (at least 8 characters), and favorite fruit.' }, { status: 400 });
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  if (isRateLimited(`signup-ip:${clientIp}`, 5, 60 * 60 * 1000)
    || isRateLimited(`signup-email:${email}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many signup attempts. Try again in an hour.' }, { status: 429 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Supabase server admin is not configured.' }, { status: 503 });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      favorite_fruit: normalizeRecoveryFruit(favoriteFruit),
      recovery_failed_attempts: 0,
      recovery_locked_until: null,
    },
  });

  if (error || !data.user) {
    const duplicate = error?.message.toLowerCase().includes('already registered');
    return NextResponse.json(
      { error: duplicate ? 'An account with this email already exists.' : 'Unable to create the account.' },
      { status: duplicate ? 409 : 400 }
    );
  }

  return NextResponse.json({ id: data.user.id, email });
}