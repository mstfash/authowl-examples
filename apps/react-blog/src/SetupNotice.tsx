import { OwlMark } from './components/icons';

/** Shown when the env vars are missing, so a fresh fork explains itself. */
export function SetupNotice() {
  return (
    <main className="setup">
      <OwlMark size={44} idPrefix="setup" />
      <h1>Almost there — add your AuthOwl keys</h1>
      <p>
        Create a project at <a href="https://authowl.dev">authowl.dev</a>, turn on{' '}
        <b>Settings → JWT issuer</b> (this example verifies JWTs in its own API), then:
      </p>
      <pre>
        <code>
          {`cp .env.example .env.local

# .env.local
`}
          <b>VITE_AUTHOWL_PUBLISHABLE_KEY</b>
          {`=pk_test_…
`}
          <b>VITE_AUTHOWL_API_URL</b>
          {`=https://authowl.dev
`}
          <b>AUTHOWL_PUBLISHABLE_KEY</b>
          {`=pk_test_…
`}
          <b>AUTHOWL_API_URL</b>
          {`=https://authowl.dev`}
        </code>
      </pre>
      <p className="setup__tail">
        Then add <code>http://localhost:5173</code> to the project&rsquo;s allowed origins and
        restart <code>npm run dev</code>.
      </p>
    </main>
  );
}
