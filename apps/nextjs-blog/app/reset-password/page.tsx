import type { Metadata } from 'next';
import { AuthShell } from '@/app/auth-shell';
import { ResetPasswordCard } from './reset-password-card';

export const metadata: Metadata = { title: 'Choose a new password · Owl Blog' };

/**
 * Where `resetPasswordUrl` on <SignIn/> points. AuthOwl validates the emailed
 * token, then redirects here with `?token=` — <ResetPassword/> reads it.
 */
export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordCard />
    </AuthShell>
  );
}
