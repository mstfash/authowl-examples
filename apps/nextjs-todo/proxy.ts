import { NextResponse } from 'next/server';
import { createAuthRedirectMiddleware } from '@authowl/next/middleware';

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. On Next 14/15, save this
 * exact file as `middleware.ts` instead — the code is identical.
 *
 * This is a UX helper, not an authorization boundary: it only checks whether a
 * session cookie is *present* so signed-out visitors land on /sign-in instead
 * of a flash of empty app. A client can forge a cookie with the right name.
 * The real gate is `auth()` inside the page and every server action.
 */
const publishableKey = process.env.AUTHOWL_PUBLISHABLE_KEY;

export default publishableKey
  ? createAuthRedirectMiddleware({
      publishableKey,
      loginPath: '/sign-in',
      // Only the app itself needs a session. /sign-in and /sign-up stay public.
      protectedPaths: [/^\/$/],
    })
  : // Not configured yet (fresh clone, no .env.local). Let everything through so
    // the app can render its setup screen — there is no session to protect.
    () => NextResponse.next();

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
