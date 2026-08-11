'use client';

import { SignIn } from '@authowl/react';

export function SignInCard() {
  return (
    <SignIn
      // Where the "Forgot password?" email should land.
      resetPasswordUrl="/reset-password"
      // This is both the post-credential destination and the OAuth return URL.
      // Returning OAuth to /sign-in leaves a successful session behind the
      // sign-in form; returning to / lets the provider finish the bridge and
      // refresh the authenticated Server Component in place.
      redirectTo="/"
    />
  );
}
