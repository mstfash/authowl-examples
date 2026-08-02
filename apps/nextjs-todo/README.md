<p align="center">
  <img src="../../.github/assets/authowl-banner.png" alt="AuthOwl" width="640">
</p>

<h1 align="center">🦉 Owl Todo</h1>

<p align="center">
  A real Next.js App Router todo app — optimistic updates, inline editing, filters, light and
  dark — with authentication by <b><code>@authowl/next</code></b>.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <a href="https://www.npmjs.com/package/@authowl/next"><img alt="@authowl/next" src="https://img.shields.io/npm/v/@authowl/next?label=%40authowl%2Fnext&logo=npm&logoColor=white&color=CB3837"></a>
</p>

---

## Run it

```bash
npm install
cp .env.example .env.local     # paste your publishable key + API URL
npm run dev                    # → http://localhost:3000
```

Then add `http://localhost:3000` to your project's allowed origins in the
[AuthOwl dashboard](https://authowl.dev). Leave `.env.local` blank and the app renders a
setup screen instead of crashing.

This example does **not** need the JWT issuer enabled — `auth()` works off the session
cookie.

## What to look at

| File | Why |
| --- | --- |
| [`app/providers.tsx`](app/providers.tsx) | `<AuthOwlProvider>` — the entire client setup, six lines |
| [`app/page.tsx`](app/page.tsx) | `auth()` in a Server Component; the user id keys the data |
| [`app/actions.ts`](app/actions.ts) | Every server action re-derives the user. **This is the security boundary.** |
| [`proxy.ts`](proxy.ts) | Redirect helper — UX only, deliberately *not* an authorization check |
| [`app/sign-in/…`](app/sign-in) · [`sign-up`](app/sign-up) · [`reset-password`](app/reset-password) · [`verify-email`](app/verify-email) | The four auth screens, one component each |
| [`lib/todos.ts`](lib/todos.ts) | A JSON file pretending to be your database — swap it out |

## The shape of it

```tsx
// app/page.tsx
const session = await requireSession();            // auth(), else redirect
const todos = await listTodos(session.user.id);    // scoped to the verified id
```

```ts
// app/actions.ts — server actions are public endpoints, so each one re-checks
export async function toggleTodoAction(id: string, done: boolean) {
  const userId = await requireUserId();
  await setTodoDone(userId, id, done);
  revalidatePath('/');
}
```

The client never says who it is. Replaying a request with someone else's id changes nothing,
because the id is never read from the request.

## Notable details

- **`proxy.ts`, not `middleware.ts`.** Next.js 16 renamed the file and silently ignores the
  old name — a leftover `middleware.ts` means your protection quietly stops running. On
  Next 14/15, rename this file back; the contents are identical.
- **Theme without a flash.** The theme is read from a cookie on the server and rendered into
  `<html data-theme>`, so there is no blocking inline script and no hydration mismatch. The
  same value is passed to `<AuthOwlProvider appearance>`, so the AuthOwl components follow
  the app's theme.
- **Optimistic everything.** `useOptimistic` applies each change instantly and the server
  action reconciles. Toggling feels local because it is, until it isn't.
- **`⌘K`** jumps to the composer. Double-click a todo to rename it.

## Swapping in a real database

Replace [`lib/todos.ts`](lib/todos.ts). Its whole contract is "read and write rows for this
user id" — the AuthOwl side does not change at all.

## License

MIT. Take it.
