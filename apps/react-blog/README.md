<p align="center">
  <img src="../../.github/assets/authowl-banner.png" alt="AuthOwl" width="640">
</p>

<h1 align="center">✍️ Owl Blog</h1>

<p align="center">
  A React blog with its <b>own backend</b>. Anyone can read the feed; writing, editing, and
  liking require an AuthOwl JWT that the API verifies itself with
  <b><code>@authowl/core/server</code></b>.
</p>

<p align="center">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="Hono" src="https://img.shields.io/badge/Hono-4-E36002?logo=hono&logoColor=white">
  <a href="https://www.npmjs.com/package/@authowl/core"><img alt="@authowl/core" src="https://img.shields.io/npm/v/@authowl/core?label=%40authowl%2Fcore&logo=npm&logoColor=white&color=CB3837"></a>
</p>

---

## Run it

```bash
npm install
cp .env.example .env.local     # paste your key + API URL (both pairs)
npm run dev                    # API on :8787, app on http://localhost:5173
```

`npm run dev` starts both halves. Vite proxies `/api` to the Node process, so the browser
calls its API same-origin and there is no CORS to configure.

**Two setup steps in the [dashboard](https://authowl.dev):**

1. Allow `http://localhost:5173` as an origin.
2. Turn on **Settings → JWT issuer**. This example is *about* JWT verification — without it,
   `getToken()` returns nothing to verify.

## What to look at

| File | Why |
| --- | --- |
| [`api/auth.ts`](api/auth.ts) | **The whole backend integration.** `verifyToken()` plus two middlewares |
| [`src/api.ts`](src/api.ts) | The client half: attach `Authorization: Bearer <token>` |
| [`api/server.ts`](api/server.ts) | Routes, and where ownership is actually enforced |
| [`src/components/RichText.tsx`](src/components/RichText.tsx) | Markdown subset rendered as React elements — no `dangerouslySetInnerHTML` |

## How the two halves meet

```ts
// src/api.ts — browser
const token = await getToken();     // short-lived, memory-only, cached until near expiry
fetch(path, { headers: { authorization: `Bearer ${token}` } });
```

```ts
// api/auth.ts — server
const verified = await verifyToken(token, { publishableKey, apiUrl });
return { id: verified.sub, claims: verified.claims };
```

`verifyToken` fetches your project's JWKS, pins ES256, and checks issuer, audience, and
expiry before returning a single claim. **There is no shared secret, and no call back to
AuthOwl per request** — after the first JWKS fetch, verification is a local signature check.

Two middlewares cover every route:

- `requireViewer` — 401 unless the token is valid.
- `optionalViewer` — anonymous is fine; a token only adds `likedByMe` and `isMine`.

## Where authorization actually happens

The author's display name comes from the **verified claims**, never the request body:

```ts
const { name, email } = viewer.claims;
```

And editing is scoped in the query itself, so somebody else's post simply never matches:

```ts
posts.findIndex((post) => post.id === id && post.authorId === authorId)
```

The UI hides what you may not do; the server refuses it regardless. Try it:

```bash
curl -s localhost:8787/api/posts          # 200 — public feed
curl -s localhost:8787/api/posts/mine     # 401 — "Sign in to do that."
curl -s -H "Authorization: Bearer nope" localhost:8787/api/posts/mine
                                          # 401 — "That session is no longer valid."
```

## Swapping in a real database

Replace [`api/store.ts`](api/store.ts). It is a JSON file behind six functions; nothing about
the AuthOwl integration changes.

## License

MIT. Take it.
