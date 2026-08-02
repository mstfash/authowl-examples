<p align="center">
  <img src=".github/assets/authowl-banner.png" alt="AuthOwl — authentication that never sleeps" width="820">
</p>

<p align="center">
  <b>Three complete apps, three AuthOwl SDKs, zero boilerplate to copy.</b><br>
  Fork one, drop in your publishable key, and you have real authentication running in about two minutes.
</p>

<p align="center">
  <a href="https://authowl.dev">authowl.dev</a> &nbsp;·&nbsp;
  <a href="https://github.com/mstfash/authowl-sdk">SDK</a> &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/org/authowl">npm</a>
</p>

<p align="center">
  <a href="https://github.com/mstfash/authowl-examples/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/mstfash/authowl-examples/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@authowl/react"><img alt="@authowl/react" src="https://img.shields.io/npm/v/@authowl/react?label=%40authowl%2Freact&logo=npm&logoColor=white&color=CB3837"></a>
  <a href="https://www.npmjs.com/package/@authowl/next"><img alt="@authowl/next" src="https://img.shields.io/npm/v/@authowl/next?label=%40authowl%2Fnext&logo=npm&logoColor=white&color=CB3837"></a>
  <a href="https://www.npmjs.com/package/@authowl/convex"><img alt="@authowl/convex" src="https://img.shields.io/npm/v/@authowl/convex?label=%40authowl%2Fconvex&logo=npm&logoColor=white&color=CB3837"></a>
  <img alt="Node" src="https://img.shields.io/badge/node-%E2%89%A520.12-3C873A?logo=node.js&logoColor=white">
  <a href="./LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-3fa34d"></a>
</p>

---

## The examples

Each one is a real app, not a login screen with a `console.log` behind it.

| App | Stack | The SDK it shows off |
| --- | --- | --- |
| **[🦉 Owl Todo](apps/nextjs-todo)** — optimistic todo list with filters, inline edit, and progress | Next.js 16 · App Router | **`@authowl/next`** — `auth()` in Server Components, protected server actions, route redirects |
| **[✍️ Owl Blog](apps/react-blog)** — public feed, drafts, likes, a tiny editor | Vite · React 19 · Hono API | **`@authowl/core/server`** — your own backend verifying AuthOwl JWTs against the project's JWKS |
| **[📋 Owl Board](apps/convex-board)** — shared kanban that syncs live between browsers | Vite · React 19 · Convex | **`@authowl/convex`** — a one-line drop-in replacement for `ConvexProviderWithClerk` |

All three use **`@authowl/react`** for the sign-in UI, and all three ship the same
handwritten design system: light + dark, keyboard-reachable, no CSS framework to learn.

Every app is **standalone** — its own `package.json`, its own README, no workspace, no
root install. `cd` into one and it works.

---

## The entire integration

Not an excerpt. This is genuinely all of it.

### Next.js — `@authowl/next`

```tsx
// app/providers.tsx — the client half
<AuthOwlProvider publishableKey={PUBLISHABLE_KEY} apiUrl={API_URL} appearance={{ theme }}>
  {children}
</AuthOwlProvider>
```

```tsx
// app/page.tsx — the server half
import { auth } from '@authowl/next/server';

const session = await auth();          // null when signed out
if (!session) redirect('/sign-in');
const todos = await listTodos(session.user.id);
```

```tsx
// app/sign-in/[[...sign-in]]/page.tsx — the whole sign-in screen
<SignIn resetPasswordUrl="/reset-password" onSignedIn={() => router.replace('/')} />
```

### Your own backend — `@authowl/core/server`

```ts
// browser: ask AuthOwl for a short-lived JWT
const token = await getToken();
fetch('/api/posts', { headers: { authorization: `Bearer ${token}` } });
```

```ts
// server: verify it against the project's published JWKS — no shared secret,
// and no round-trip back to AuthOwl on every request
import { verifyToken } from '@authowl/core/server';

const { sub, claims } = await verifyToken(token, { publishableKey, apiUrl });
// `sub` is the user id, and you can trust it.
```

### Convex — `@authowl/convex`

```tsx
<AuthOwlProvider publishableKey={pk} apiUrl={apiUrl}>
  <ConvexProviderWithAuthOwl client={convex} useAuth={useAuth}>
    <App />
  </ConvexProviderWithAuthOwl>
</AuthOwlProvider>
```

```ts
// convex/cards.ts — Convex already verified the JWT before this ran
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error('Sign in to use the board.');
await ctx.db.insert('cards', { authorId: identity.subject, /* … */ });
```

---

## Quick start

**1. Create a project** at [authowl.dev](https://authowl.dev) and copy its publishable key
(`pk_test_…`). It is safe to ship in a browser bundle — it is scoped to one environment and
to the origins you allow-list.

**2. Allow the example's origin** in the dashboard, so the browser may call the API:

| App | Origin to allow |
| --- | --- |
| Owl Todo | `http://localhost:3000` |
| Owl Blog | `http://localhost:5173` |
| Owl Board | `http://localhost:5174` |

**3. Run one.**

```bash
git clone https://github.com/mstfash/authowl-examples.git
cd authowl-examples/apps/nextjs-todo

npm install
cp .env.example .env.local     # paste your key + API URL
npm run dev                    # → http://localhost:3000
```

Forget a value and the app renders a setup screen telling you which one, instead of a stack
trace.

> **Owl Blog and Owl Board additionally need the project's JWT issuer switched on**
> (dashboard → **Settings → JWT issuer**). That is what publishes the JWKS their backends
> verify against. Owl Todo does not need it.

Prefer to scaffold from scratch? `npx authowl` logs you in, detects your Next.js or Vite
app, and wires the same setup transactionally.

---

## Which package do I need?

| Package | Use it when |
| --- | --- |
| [`@authowl/react`](https://www.npmjs.com/package/@authowl/react) | You render UI in React. Provider, hooks, and drop-in `<SignIn/>`, `<SignUp/>`, `<UserButton/>`, `<UserProfile/>`, passkeys, MFA, organizations. |
| [`@authowl/next`](https://www.npmjs.com/package/@authowl/next) | You need the session on the **server** — Server Components, route handlers, server actions. |
| [`@authowl/core`](https://www.npmjs.com/package/@authowl/core) | Anything else. Framework-agnostic client, plus `@authowl/core/server` for JWT verification and the typed Admin API. |
| [`@authowl/convex`](https://www.npmjs.com/package/@authowl/convex) | Your backend is Convex. |
| [`authowl`](https://www.npmjs.com/package/authowl) | The CLI: `npx authowl` for login and project scaffolding. |

---

## What the SDK handles so the examples don't

None of these apps contain a password field, an OTP input, a QR code, or a session
refresher. `<SignIn/>` reads your project's public config and renders exactly the methods
you switched on:

- password · magic link · email OTP · phone OTP · passkeys · social · enterprise SSO
- MFA enrolment and challenge, backup codes
- password reset, email verification, consent gates
- account settings, device and session management, organization switching
- English and Arabic, with RTL handled automatically

Turn a method on in the dashboard and it appears — no code change in these apps.

### Two ways to mount all this

| | Embedded components *(what these examples use)* | Hosted account portal |
| --- | --- | --- |
| Where it runs | Inside your app, on your domain, in your design | On AuthOwl, at a URL you link to |
| You write | A route per surface, one component in each | A link |
| Covers | Everything the SDK exports | Sign in · Sign up · Unauthorized sign-in · User profile · Sign out |

The examples take the embedded path because it keeps users on your domain and exercises more
of the SDK. If you would rather not own the routes, point people at the portal URLs from
**Settings → Account portal** instead.

One nuance either way: **password reset and email verification always need a route in your
app.** Both are landing pages for an emailed link, so the link has to arrive on your origin —
which is what `resetPasswordUrl` and `verifyEmailUrl` are for. The portal does not cover them.
`<ResetPassword/>` and `<VerifyEmail/>` do all the work once the browser gets there; see
[Owl Todo's note](apps/nextjs-todo/README.md#why-reset-password-and-verify-email-exist).

---

## Security notes worth copying

The examples are written the way production code should be, and each one demonstrates the
same rule from a different angle:

- **The user id always comes from a verified session**, never from the request body. Owl
  Todo re-checks `auth()` inside every server action; Owl Blog scopes every query by the
  `sub` claim; Owl Board reads `ctx.auth.getUserIdentity()` inside each mutation.
- **Middleware is a UX helper, not a boundary.** `createAuthRedirectMiddleware` only checks
  whether a cookie is *present*. The real gate is `auth()` in the page.
- **Ownership checks live on the server.** Owl Blog's "delete" is a query filtered by author
  id, so another user's id simply never matches. Owl Board hides the delete button for cards
  you did not write *and* refuses the mutation.
- **Session tokens stay in HttpOnly cookies.** `getToken()` mints a separate short-lived JWT
  for backends; the durable session value never reaches JavaScript.

---

## Repo layout

```
authowl-examples/
├── apps/
│   ├── nextjs-todo/     # @authowl/next  — App Router, server actions
│   ├── react-blog/      # @authowl/core  — SPA + your own JWT-verifying API
│   └── convex-board/    # @authowl/convex — realtime, stateless verification
├── .github/workflows/   # CI: typecheck + build every app on every push
└── LICENSE              # MIT — copy anything you like
```

---

## Troubleshooting

<details>
<summary><b>"origin not allowed" in the console</b></summary>

The publishable key is valid but the page's origin is not on the project's allow-list. Add
`http://localhost:3000` / `:5173` / `:5174` in the dashboard, then reload.
</details>

<details>
<summary><b>The sign-in form only offers a password, and a dev warning mentions public config</b></summary>

The SDK could not fetch your project's public config, so it fell back to a password-only
form. Usually a wrong `apiUrl`, a key pointing at a deleted project, or a disallowed origin.
</details>

<details>
<summary><b><code>getToken()</code> returns null (Owl Blog, Owl Board)</b></summary>

The project's **JWT issuer** is off. Turn it on in **Settings → JWT issuer** — that is what
mints the token and publishes the JWKS your backend verifies against.
</details>

<details>
<summary><b>Convex says the token was rejected</b></summary>

`convex/auth.config.ts` must match your project's `jwtIssuer` block exactly. Copy the issuer
verbatim: `localhost` and `127.0.0.1` are different JWT issuers even when they resolve to
the same machine.
</details>

<details>
<summary><b>Next.js: <code>middleware.ts</code> vs <code>proxy.ts</code></b></summary>

Next.js 16 renamed the file convention from `middleware.ts` to `proxy.ts`. This repo ships
`proxy.ts`. On Next 14/15, rename it back to `middleware.ts` — the contents are identical.

On Next 16 the old name still works, with a deprecation warning:

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

Keeping **both** files, however, is a hard error and the dev server will not serve:

```
Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected.
Please use "./proxy.ts" only.
```

So if you rename it, delete the old one. (Verified on Next 16.2.12.)
</details>

---

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). If you build something
with AuthOwl worth showing off, we would love to link it.

## License

[MIT](./LICENSE) — fork it, ship it, no attribution required.
