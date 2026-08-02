import type { Post } from './store.js';

/**
 * What the feed shows before anyone has written anything, so a fresh clone
 * looks like a blog instead of an empty page. These are read-only for you:
 * they belong to made-up author ids, so the API will refuse an edit or delete
 * exactly as it would for any other person's post. Liking them works.
 *
 * They stop being special the moment you save your first post — the whole set
 * is written to `.data/posts.json` and becomes ordinary data.
 */
export const SEED_POSTS: Post[] = [
  {
    id: 'seed-0000-0000-0000-000000000001',
    authorId: 'seed:mona',
    authorName: 'Mona Hassan',
    title: 'Why we stopped writing our own session tables',
    body: `Every product I have shipped started the same way: a \`users\` table, a \`sessions\` table, and a weekend of bcrypt.

It always looked cheap up front. Then came password reset, then email verification, then *someone* asked for Google sign-in, and by month four we had a small identity provider nobody wanted to own.

The honest version of the trade is this: authentication is not hard to write once. It is hard to keep correct for years, across every browser, on every device, while the threat model moves under you.

So now the whole thing is **one provider component and one server call**. The rest of the weekend goes back to the product.`,
    tags: ['auth', 'postmortem'],
    published: true,
    likedBy: ['seed:tarek', 'seed:yara'],
    createdAt: '2026-07-28T09:12:00.000Z',
    updatedAt: '2026-07-28T09:12:00.000Z',
  },
  {
    id: 'seed-0000-0000-0000-000000000002',
    authorId: 'seed:tarek',
    authorName: 'Tarek',
    title: 'Passkeys, one year in',
    body: `We turned passkeys on as an option, not a mandate, and left password sign-in exactly where it was.

Adoption was slow for a month and then it was not. The thing that moved the number was not a banner — it was putting the passkey button *above* the password field for people whose device already had one.

If you are about to roll this out: measure the fallback path first. The failure you care about is not \`passkey unsupported\`, it is the person who enrolled on their laptop and is now standing in a queue with their phone.`,
    tags: ['passkeys', 'webauthn'],
    published: true,
    likedBy: ['seed:mona'],
    createdAt: '2026-07-21T16:40:00.000Z',
    updatedAt: '2026-07-21T16:40:00.000Z',
  },
  {
    id: 'seed-0000-0000-0000-000000000003',
    authorId: 'seed:yara',
    authorName: 'Yara',
    title: 'A short note on verifying tokens at the edge',
    body: `Your backend does not need to phone home on every request. It needs the issuer's public keys, and those are published.

Fetch the JWKS once, cache it, pin the algorithm, and check \`iss\`, \`aud\`, and \`exp\` before you read a single custom claim. That is the entire ceremony — and it is the difference between a request that costs a signature check and one that costs a network round-trip.

The part people skip is pinning. If you accept whatever \`alg\` the token says it used, you have not verified anything.`,
    tags: ['jwt', 'jwks', 'security'],
    published: true,
    likedBy: [],
    createdAt: '2026-07-14T11:05:00.000Z',
    updatedAt: '2026-07-14T11:05:00.000Z',
  },
];
