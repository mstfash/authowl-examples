'use client';

import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthOwlNextFetch } from '@authowl/next/client';
import { AuthOwlProvider, useUser } from '@authowl/react';
import '@authowl/react/styles.css';
import { SetupNotice } from './setup-notice';

/**
 * Everything AuthOwl needs on the client is this provider. It fetches your
 * project's public config and renders exactly the sign-in methods you enabled
 * in the dashboard — password, magic link, email OTP, passkeys, social, SSO —
 * so turning one on never requires a code change here.
 */

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_AUTHOWL_PUBLISHABLE_KEY;
const API_URL = process.env.NEXT_PUBLIC_AUTHOWL_API_URL;
const AUTHOWL_FETCH = PUBLISHABLE_KEY && API_URL
  ? createAuthOwlNextFetch({ publishableKey: PUBLISHABLE_KEY, apiUrl: API_URL })
  : null;

export type Theme = 'light' | 'dark';

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useTheme() {
  return use(ThemeContext);
}

function RefreshAfterRedirect({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const refreshed = useRef(false);

  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn || refreshed.current) return;
    refreshed.current = true;
    // The bridge-aware fetch does not publish this session until the app-origin
    // HttpOnly cookie exists. Refreshing here makes the Server Component see
    // that cookie without polling or asking the user to sign in a second time.
    router.refresh();
  }, [enabled, isLoaded, isSignedIn, router]);

  return null;
}

export function Providers({ initialTheme, children }: { initialTheme: Theme; children: ReactNode }) {
  // Capture this during the destination document's first client render. The
  // SDK deliberately removes the one-time credential as it redeems it.
  const [redirectReturn] = useState(
    () => typeof window !== 'undefined' && window.location.hash.includes('authowl_code'),
  );
  // The server already rendered <html data-theme> from a cookie, so there is no
  // flash and no hydration mismatch. The toggle just keeps both in sync.
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      document.cookie = `owl-theme=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  if (!PUBLISHABLE_KEY || !API_URL || !AUTHOWL_FETCH) return <SetupNotice />;

  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      <AuthOwlProvider
        publishableKey={PUBLISHABLE_KEY}
        apiUrl={API_URL}
        fetch={AUTHOWL_FETCH}
        // The drop-in components follow the app's theme and accent.
        appearance={{ theme }}
      >
        <RefreshAfterRedirect enabled={redirectReturn} />
        {children}
      </AuthOwlProvider>
    </ThemeContext>
  );
}
