import { NextRequest, NextResponse } from 'next/server';
import { isRecoveryFruit, normalizeRecoveryFruit } from '@/lib/auth/recovery';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  let body: { email?: string; favoriteFruit?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const favoriteFruit = body.favoriteFruit ?? '';
  const newPassword = body.newPassword ?? '';

  if (!email || !email.includes('@') || !isRecoveryFruit(favoriteFruit) || newPassword.length < 8) {
    return NextResponse.json({ error: 'Enter a valid email, favorite fruit, and new password (at least 8 characters).' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Supabase server admin is not configured.' }, { status: 503 });
  }

  const genericFailure = 'The email or favorite fruit did not match.';
  const usersPerPage = 1000;
  let matchingUser: { id: string; app_metadata?: Record<string, unknown> } | undefined;
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: usersPerPage });
    if (error) {
      console.error('[auth] Could not check account recovery:', error.message);
      return NextResponse.json({ error: 'Password recovery is temporarily unavailable.' }, { status: 503 });
    }

    matchingUser = data.users.find((user) => user.email?.toLowerCase() === email);
    if (matchingUser || data.users.length < usersPerPage) break;
  }

  if (!matchingUser) {
    return NextResponse.json({ error: genericFailure }, { status: 400 });
  }

  const appMetadata = matchingUser.app_metadata ?? {};
  const lockedUntil = Date.parse(String(appMetadata.recovery_locked_until ?? ''));
  if (Number.isFinite(lockedUntil) && lockedUntil > Date.now()) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  if (normalizeRecoveryFruit(String(appMetadata.favorite_fruit ?? '')) !== normalizeRecoveryFruit(favoriteFruit)) {
    const failedCount = Number(appMetadata.recovery_failed_attempts ?? 0) + 1;
    const isLocked = failedCount >= MAX_FAILED_ATTEMPTS;
    const { error: attemptError } = await admin.auth.admin.updateUserById(matchingUser.id, {
      app_metadata: {
        ...appMetadata,
        recovery_failed_attempts: isLocked ? 0 : failedCount,
        recovery_locked_until: isLocked ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null,
      },
    });
    if (attemptError) {
      console.error('[auth] Could not record recovery attempt:', attemptError.message);
      return NextResponse.json({ error: 'Password recovery is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json({ error: genericFailure }, { status: 400 });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(matchingUser.id, {
    password: newPassword,
    app_metadata: {
      ...appMetadata,
      recovery_failed_attempts: 0,
      recovery_locked_until: null,
    },
  });
  if (updateError) {
    console.error('[auth] Password update failed:', updateError.message);
    return NextResponse.json({ error: 'Unable to reset password. Please try again.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}