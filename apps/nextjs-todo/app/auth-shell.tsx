import type { ReactNode } from 'react';
import { OwlMark } from './owl';

const FEATURES = [
  'Password, magic link, email OTP, passkeys, and social — whatever you switch on in the dashboard.',
  'Sessions in HttpOnly cookies. The browser never touches a durable token.',
  'MFA, device management, and account settings ship as components you drop in.',
];

/**
 * The marketing half of the auth screens. Nothing here is AuthOwl-specific —
 * it is just the frame around whichever drop-in component the page renders.
 */
export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth__brand">
        <svg className="auth__stars" aria-hidden="true">
          <g fill="#F5B84C">
            <circle cx="82%" cy="14%" r="2.2" opacity="0.7" />
            <circle cx="91%" cy="26%" r="1.5" opacity="0.5" />
            <circle cx="74%" cy="8%" r="1.4" opacity="0.45" />
            <circle cx="88%" cy="61%" r="1.8" opacity="0.35" />
            <circle cx="66%" cy="78%" r="1.3" opacity="0.3" />
          </g>
        </svg>

        <span className="auth__lockup">
          <OwlMark size={34} idPrefix="auth" />
          Owl Todo
        </span>

        <div className="auth__pitch">
          <h1>
            The todo app that
            <br />
            <em>never forgets you</em>.
          </h1>
          <p>
            A complete Next.js App Router example — sign-in, sign-up, password reset, email
            verification, and a protected app — wired to AuthOwl in under 40 lines.
          </p>

          <ul className="auth__features">
            {FEATURES.map((feature) => (
              <li key={feature}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth__meta">
          Built with <a href="https://www.npmjs.com/package/@authowl/next">@authowl/next</a> ·{' '}
          <a href="https://github.com/mstfash/authowl-examples">source</a>
        </p>
      </aside>

      <section className="auth__panel">
        <div className="auth__card">
          {children}
          {footer ? <p className="auth__switch">{footer}</p> : null}
        </div>
      </section>
    </div>
  );
}
