import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthOwlProvider } from '@authowl/react';
import '@authowl/react/styles.css';
import './styles.css';
import { App } from './App';
import { SetupNotice } from './SetupNotice';
import { useThemeToggle } from './theme';

const PUBLISHABLE_KEY = import.meta.env.VITE_AUTHOWL_PUBLISHABLE_KEY as string | undefined;
const API_URL = import.meta.env.VITE_AUTHOWL_API_URL as string | undefined;

const root = createRoot(document.getElementById('root')!);

function ConfiguredApp() {
  const { theme, toggle } = useThemeToggle();
  return (
    <AuthOwlProvider
      publishableKey={PUBLISHABLE_KEY!}
      apiUrl={API_URL!}
      locale="auto"
      appearance={{ theme }}
    >
      <App theme={theme} onToggleTheme={toggle} />
    </AuthOwlProvider>
  );
}

root.render(
  <StrictMode>
    {PUBLISHABLE_KEY && API_URL ? (
      // Everything AuthOwl needs on the client. The provider fetches the
      // project's public config and renders exactly the sign-in methods you
      // enabled in the dashboard.
      <ConfiguredApp />
    ) : (
      <SetupNotice />
    )}
  </StrictMode>,
);
