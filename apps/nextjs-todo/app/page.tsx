import { UserButton } from '@authowl/react';
import { displayName, isConfigured, requireSession } from '@/lib/session';
import { listTodos } from '@/lib/todos';
import { OwlMark } from './owl';
import { SetupNotice } from './setup-notice';
import { ThemeToggle } from './theme-toggle';
import { TodoApp } from './todo-app';

/** `auth()` reads cookies, so this page is dynamic by definition. */
export const dynamic = 'force-dynamic';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function HomePage() {
  // Fresh clone with no keys yet: explain, don't crash.
  if (!isConfigured) return <SetupNotice />;

  // Three lines is the whole server-side integration: get the session, bounce
  // if there isn't one, and use its user id as the tenant key for your data.
  const session = await requireSession();
  const todos = await listTodos(session.user.id);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <span className="brand">
            <OwlMark size={30} idPrefix="nav" />
            Owl Todo
            <span className="brand__sub">/ Next.js</span>
          </span>
          <div className="topbar__actions">
            <ThemeToggle />
            {/* Avatar, account settings, devices, passkeys, sign out — one component. */}
            <UserButton />
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <TodoApp
            initialTodos={todos}
            greeting={greeting()}
            name={displayName(session)}
            today={today}
          />
          <p className="footnote">
            Signed in as <code>{session.user.email ?? session.user.phoneNumber ?? session.user.id}</code>
            <br />
            Todos are stored per user in <code>.data/todos.json</code> — swap{' '}
            <code>lib/todos.ts</code> for your own database.
          </p>
        </div>
      </main>
    </div>
  );
}
