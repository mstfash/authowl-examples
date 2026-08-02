import type { Metadata } from 'next';
import { AuthShell } from '@/app/auth-shell';
import { VerifyEmailCard } from './verify-email-card';

export const metadata: Metadata = { title: 'Verify your email · Owl Todo' };

/**
 * Where `verifyEmailUrl` on <SignUp/> points. AuthOwl confirms the address
 * server-side and redirects here; <VerifyEmail/> reads the outcome from the URL
 * and offers a resend when the link had expired.
 */
export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <VerifyEmailCard />
    </AuthShell>
  );
}
