import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@authowl/next/server';
import { AuthShell } from '@/app/auth-shell';
import { isConfigured } from '@/lib/session';
import { SignInCard } from './sign-in-card';

export const metadata: Metadata = { title: 'Sign in · Owl Blog' };
export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  // A stale tab, back navigation, or an OAuth return must never show a sign-in
  // form to a user whose app-origin session is already valid.
  if (isConfigured && await auth()) redirect('/');

  return (
    <AuthShell
      footer={
        <>
          New here? <Link href="/sign-up">Create an account</Link>
        </>
      }
    >
      <SignInCard />
    </AuthShell>
  );
}
