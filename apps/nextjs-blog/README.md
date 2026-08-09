<p align="center">
  <img src="../../.github/assets/authowl-banner.png" alt="AuthOwl" width="640">
</p>

<h1 align="center">✍️ Owl Blog</h1>

<p align="center">
  A Next.js App Router blog with public server-rendered reading and authenticated server
  actions protected by <b><code>@authowl/next</code></b>.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <a href="https://www.npmjs.com/package/@authowl/next"><img alt="@authowl/next" src="https://img.shields.io/npm/v/@authowl/next?label=%40authowl%2Fnext&logo=npm&logoColor=white&color=CB3837"></a>
</p>

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev                    # http://localhost:3000
```

Add `http://localhost:3000` to the project's allowed origins. This example does not require
the JWT issuer: `auth()` reads either AuthOwl's native session cookie or the validated
app-origin bridge cookie.

## What to look at

| File | Why |
| --- | --- |
| [`app/page.tsx`](app/page.tsx) | Public feed data and the optional session are read in a Server Component |
| [`app/actions.ts`](app/actions.ts) | Every write re-checks `auth()` and derives the user id on the server |
| [`app/api/authowl/session/route.ts`](app/api/authowl/session/route.ts) | Validates and projects cross-origin browser sessions into a host-only HttpOnly cookie for server rendering |
| [`lib/posts.ts`](lib/posts.ts) | File-backed demo store with ownership checks inside update and delete |
| [`app/providers.tsx`](app/providers.tsx) | Client provider for AuthOwl UI, session hooks, and account settings |
| [`app/sign-in`](app/sign-in) and [`app/sign-up`](app/sign-up) | App Router auth pages using the drop-in components |

## The security boundary

The feed is intentionally public. Mutations are exported server actions, which are public
HTTP entry points, so every action starts by obtaining a fresh verified session:

```ts
export async function updatePostAction(id: string, input: PostInput) {
  const session = await requireSession();
  const post = await updatePost(id, session.user.id, cleanInput(input));
  if (!post) throw new Error('That post does not exist or is not yours.');
  return toWire(post, session.user.id);
}
```

The browser supplies the post id and content, but never the author id. `updatePost` and
`deletePost` match both the row id and `session.user.id`, so another user's row is
indistinguishable from a missing one.

## Data store

`lib/posts.ts` serializes writes into `.data/posts.json` so the example needs no database.
Replace that module with Postgres, Drizzle, Prisma, or your existing repository layer; the
AuthOwl integration and server-action boundaries stay the same.

## Password reset and email verification

The local `/reset-password` and `/verify-email` routes are landing pages for emailed links.
They mount AuthOwl's drop-in components. If the hosted account portal is enabled for your
project, point the sign-in and sign-up props at its URLs instead and remove the local pages.

## License

MIT. Take it.
