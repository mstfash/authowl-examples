'use client';

import { useRouter } from 'next/navigation';
import { SignUp } from '@authowl/react';

export function SignUpCard() {
  const router = useRouter();

  return (
    <SignUp
      // Where the confirmation link should land when the project requires
      // email verification.
      verifyEmailUrl="/verify-email"
      onSignedUp={() => {
        router.refresh();
      }}
    />
  );
}
