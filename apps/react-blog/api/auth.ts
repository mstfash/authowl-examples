import { verifyToken, TokenVerificationError } from '@authowl/core/server';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * The whole backend integration.
 *
 * The browser sends a short-lived project JWT that AuthOwl minted for it
 * (`getToken()` on the client). `verifyToken` checks the signature against the
 * project's published JWKS and validates issuer, audience, and expiry — no
 * shared secret, and no round-trip to AuthOwl on every request.
 *
 * If it resolves, `sub` is the user id and you can trust it.
 */

export type Viewer = {
  id: string;
  /** Every verified claim, for handlers that want email / name / org. */
  claims: Record<string, unknown>;
};

/** The Hono environment shared by the whole API. */
export type BlogEnv = { Variables: { viewer?: Viewer } };

function bearer(context: Context<BlogEnv>): string | null {
  const header = context.req.header('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (!token || scheme?.toLowerCase() !== 'bearer') return null;
  return token;
}

async function verify(token: string): Promise<Viewer> {
  const verified = await verifyToken(token, {
    publishableKey: process.env.AUTHOWL_PUBLISHABLE_KEY!,
    apiUrl: process.env.AUTHOWL_API_URL!,
  });
  if (!verified.sub) throw new HTTPException(401, { message: 'Token carries no subject.' });
  return { id: verified.sub, claims: verified.claims };
}

/** Rejects the request unless it carries a valid AuthOwl token. */
export async function requireViewer(context: Context<BlogEnv>, next: Next) {
  const token = bearer(context);
  if (!token) throw new HTTPException(401, { message: 'Sign in to do that.' });

  try {
    context.set('viewer', await verify(token));
  } catch (error) {
    if (error instanceof TokenVerificationError) {
      throw new HTTPException(401, { message: 'That session is no longer valid.' });
    }
    throw error;
  }
  await next();
}

/**
 * The same check, except a missing or bad token is fine — the handler simply
 * gets no viewer. The public feed uses it to mark which posts you already liked.
 */
export async function optionalViewer(context: Context<BlogEnv>, next: Next) {
  const token = bearer(context);
  if (token) {
    try {
      context.set('viewer', await verify(token));
    } catch {
      // Reading the feed anonymously is a supported state, not an error.
    }
  }
  await next();
}

/** Narrowing helper: the viewer a `requireViewer` route is guaranteed to have. */
export function viewerOf(context: Context<BlogEnv>): Viewer {
  const viewer = context.get('viewer');
  if (!viewer) throw new HTTPException(401, { message: 'Sign in to do that.' });
  return viewer;
}
