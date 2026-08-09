import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '@/app/auth-shell';
import { SignUpCard } from './sign-up-card';

export const metadata: Metadata = { title: 'Create your account · Owl Blog' };

export default function SignUpPage() {
  return (
    <AuthShell
      footer={
        <>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </>
      }
    >
      <SignUpCard />
    </AuthShell>
  );
}
