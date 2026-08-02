import { OwlMark } from './components/icons';

export function SetupNotice({ missing }: { missing: { authowl: boolean; convex: boolean } }) {
  return (
    <main className="setup">
      <OwlMark size={44} idPrefix="setup" />
      <h1>Two things to wire up</h1>

      <ol className="setup__steps">
        <li data-done={!missing.authowl}>
          <b>AuthOwl</b> — create a project at <a href="https://authowl.dev">authowl.dev</a>, turn
          on <b>Settings → JWT issuer</b>, and allow <code>http://localhost:5174</code> as an
          origin.
        </li>
        <li data-done={!missing.convex}>
          <b>Convex</b> — run <code>npx convex dev</code>, then point the deployment at your
          project&rsquo;s issuer:
        </li>
      </ol>

      <pre>
        <code>
          {`npx convex env set `}
          <b>AUTHOWL_ISSUER_URL</b>
          {` <jwtIssuer.issuer>
npx convex env set `}
          <b>AUTHOWL_PROJECT_ID</b>
          {` <jwtIssuer.aud>

cp .env.example .env.local   # then fill:
`}
          <b>VITE_AUTHOWL_PUBLISHABLE_KEY</b>
          {`=pk_test_…
`}
          <b>VITE_AUTHOWL_API_URL</b>
          {`=https://authowl.dev
`}
          <b>VITE_CONVEX_URL</b>
          {`=https://<deployment>.convex.cloud`}
        </code>
      </pre>

      <p className="setup__tail">
        <code>jwtIssuer.issuer</code> and <code>jwtIssuer.aud</code> come from your project&rsquo;s
        public config. Copy the issuer exactly — <code>localhost</code> and <code>127.0.0.1</code>{' '}
        are different JWT issuers.
      </p>
    </main>
  );
}
