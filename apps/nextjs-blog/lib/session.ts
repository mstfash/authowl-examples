import 'server-only';
import { redirect } from 'next/navigation';
import { auth, type Session } from '@authowl/next/server';

/**
 * Whether the server half is configured. A fresh clone has no `.env.local`, and
 * the app should say so rather than throw from inside `auth()`.
 */
export const isConfigured = Boolean(
  process.env.AUTHOWL_PUBLISHABLE_KEY && process.env.AUTHOWL_API_URL,
);

/**
 * `auth()` is the real gate. It forwards the session cookie to AuthOwl and
 * returns null when there is no valid session — a forged cookie does not pass.
 * Call it in every page and every server action that touches user data.
 */
export async function requireSession(): Promise<NonNullable<Session>> {
  const session = await auth();
  if (!session) redirect('/sign-in');
  return session;
}

/** The signed-in user's id. Every store read/write is scoped to this value. */
export async function requireUserId(): Promise<string> {
  const session = await requireSession();
  return session.user.id;
}

/** A friendly display name, falling back through the identifiers AuthOwl may hold. */
export function displayName(session: NonNullable<Session>): string {
  const { name, email, phoneNumber } = session.user;
  if (name?.trim()) return name.trim().split(' ')[0]!;
  if (email) return email.split('@')[0]!;
  return phoneNumber ?? 'there';
}
