import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '@/app/auth-shell';
import { SignInCard } from './sign-in-card';

export const metadata: Metadata = { title: 'Sign in · Owl Todo' };

export default function SignInPage() {
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
