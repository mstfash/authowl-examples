import { OwlMark } from './owl';

/**
 * Shown instead of the app when the AuthOwl env vars are missing, so a fresh
 * fork explains itself rather than throwing a stack trace.
 */
export function SetupNotice() {
  return (
    <main className="setup">
      <OwlMark size={44} idPrefix="setup" />
      <h1>Almost there - add your AuthOwl keys</h1>
      <p>
        Create a project at <a href="https://authowl.dev">authowl.dev</a>, copy its publishable key,
        then create <code>.env.local</code> in this app:
      </p>
      <pre>
        <code>
          {`cp .env.example .env.local

# .env.local
`}
          <b>AUTHOWL_PUBLISHABLE_KEY</b>
          {`=pk_test_…
`}
          <b>AUTHOWL_API_URL</b>
          {`=https://authowl.dev
`}
          <b>NEXT_PUBLIC_AUTHOWL_PUBLISHABLE_KEY</b>
          {`=pk_test_…
`}
          <b>NEXT_PUBLIC_AUTHOWL_API_URL</b>
          {`=https://authowl.dev`}
        </code>
      </pre>
      <p style={{ marginBlockStart: 16, marginBlockEnd: 0, fontSize: 13.5 }}>
        Then add <code>http://localhost:3000</code> to the project&rsquo;s allowed origins and
        restart <code>npm run dev</code>. The public feed needs no session; every mutation does.
      </p>
    </main>
  );
}
