import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithAuthOwl } from '@authowl/convex';
import { AuthOwlProvider, useAuth } from '@authowl/react';
import '@authowl/react/styles.css';
import './styles.css';
import { App } from './App';
import { SetupNotice } from './SetupNotice';

const PUBLISHABLE_KEY = import.meta.env.VITE_AUTHOWL_PUBLISHABLE_KEY as string | undefined;
const API_URL = import.meta.env.VITE_AUTHOWL_API_URL as string | undefined;
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;

const root = createRoot(document.getElementById('root')!);

if (!PUBLISHABLE_KEY || !API_URL || !CONVEX_URL) {
  root.render(
    <StrictMode>
      <SetupNotice
        missing={{
          authowl: !PUBLISHABLE_KEY || !API_URL,
          convex: !CONVEX_URL,
        }}
      />
    </StrictMode>,
  );
} else {
  const convex = new ConvexReactClient(CONVEX_URL);

  root.render(
    <StrictMode>
      <AuthOwlProvider publishableKey={PUBLISHABLE_KEY} apiUrl={API_URL}>
        {/*
          The one line that replaces ConvexProviderWithClerk. It hands Convex a
          fresh AuthOwl JWT whenever the session changes; Convex verifies it
          against your project's JWKS on its own side.
        */}
        <ConvexProviderWithAuthOwl client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithAuthOwl>
      </AuthOwlProvider>
    </StrictMode>,
  );
}
