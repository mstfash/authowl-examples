# Contributing

Thanks for looking. This repo exists to make AuthOwl obvious in about two minutes, so the
bar for changes is "does it make the example clearer or more honest?"

## Ground rules

- **Never commit a key.** Every `.env.example` ships blank; real values go in `.env.local`,
  which is gitignored. CI fails the build if a key-shaped string appears in tracked files.
- **Each app stays standalone.** Its own `package.json`, its own lockfile, no workspace and
  no shared package. Someone should be able to copy one directory out and have it work.
- **No CSS framework.** The styles are handwritten so a reader can see exactly what the app
  does and what the SDK does. Keep the AuthOwl palette (gold `#F5B84C` on night `#0B0906`)
  and keep both themes working.
- **Show the security boundary.** Every example re-derives the user from a verified session
  on the server. If a change makes it look like the client can be trusted, it will not land.

## Running an app

```bash
cd apps/<app>
npm install
cp .env.example .env.local     # fill from your AuthOwl dashboard
npm run dev
```

Allowed origins per app: `nextjs-todo` → `http://localhost:3000`, `react-blog` →
`http://localhost:5173`, `convex-board` → `http://localhost:5174`.

`react-blog` and `convex-board` also need the project's **JWT issuer** enabled.

## Before opening a PR

```bash
cd apps/<app>
npm run typecheck
npm run build
```

Both run in CI for all three apps. Please check the app in **light and dark**, at desktop
and phone widths, before pushing UI changes.

## Adding an example

New examples are welcome when they show a genuinely different integration — a framework the
repo does not cover, or an SDK surface (organizations, admin API, webhooks) that none of the
current apps exercise. Open an issue first so we can agree on the shape.

An example should include: a README with a "what to look at" table, a `.env.example` with
blank values, a setup screen for missing config, and an entry in the CI matrix.
