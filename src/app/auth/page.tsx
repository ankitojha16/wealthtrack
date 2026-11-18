import React, { Suspense } from 'react';
import { AuthScreen } from '@/components/auth/AuthScreen';

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthScreen />
    </Suspense>
  );
}
