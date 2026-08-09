<p align="center">
  <img src="../../.github/assets/authowl-banner.png" alt="AuthOwl" width="640">
</p>

<h1 align="center">🦉 Owl Todo</h1>

<p align="center">
  A true browser-only React SPA: no Node API, server actions, middleware, or backend setup.
  Authentication and account management come from <b><code>@authowl/react</code></b>.
</p>

<p align="center">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <a href="https://www.npmjs.com/package/@authowl/react"><img alt="@authowl/react" src="https://img.shields.io/npm/v/@authowl/react?label=%40authowl%2Freact&logo=npm&logoColor=white&color=CB3837"></a>
</p>

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev                    # http://localhost:5173
```

Paste the browser-safe publishable key and API URL from the AuthOwl dashboard, then allow
`http://localhost:5173` as an origin. This example does not need a JWT issuer or a second
process.

## What it demonstrates

| File | Why |
| --- | --- |
| [`src/main.tsx`](src/main.tsx) | The complete provider setup, including theme and automatic locale |
| [`src/App.tsx`](src/App.tsx) | Sign-in, sign-up, reset, verification, `useUser()`, and `<UserButton/>` in one SPA |
| [`src/TodoApp.tsx`](src/TodoApp.tsx) | Client state persisted under a key scoped to the signed-in AuthOwl user id |

The todo data deliberately lives in `localStorage`. That makes the architecture honest:
this example teaches the client SDK and can be deployed as static files. Browser storage is
not a server authorization boundary and does not sync between devices. Use the Next.js or
Convex example when the application data itself needs a backend.

## SPA routes

`/reset-password` and `/verify-email` render the SDK landing components. Configure your
static host to send unknown paths to `index.html`, which is the standard Vite SPA fallback.
If you use AuthOwl's hosted account portal instead, point the two component props at those
hosted URLs and remove the local routes.

## License

MIT. Take it.
