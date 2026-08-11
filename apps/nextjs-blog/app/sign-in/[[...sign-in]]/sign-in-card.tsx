'use client';

import { useRouter } from 'next/navigation';
import { SignIn } from '@authowl/react';

export function SignInCard() {
  const router = useRouter();

  return (
    <SignIn
      redirectTo="/"
      // Where the "Forgot password?" email should land.
      resetPasswordUrl="/reset-password"
      onSignedIn={() => {
        // The home page is a Server Component that calls auth() — refresh so it
        // re-renders with the new session instead of a cached signed-out copy.
        router.refresh();
      }}
    />
  );
}
