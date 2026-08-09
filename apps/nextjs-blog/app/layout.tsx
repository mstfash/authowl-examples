import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Providers, type Theme } from './providers';
import './globals.css';
import './blog.css';

export const metadata: Metadata = {
  title: 'Owl Blog - AuthOwl Next.js example',
  description:
    'A server-rendered blog with AuthOwl sessions protecting Next.js server actions.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0906' },
    { media: '(prefers-color-scheme: light)', color: '#fbf8f2' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the theme on the server means the first paint is already correct —
  // no flash of the wrong theme, no blocking inline script.
  const theme: Theme = (await cookies()).get('owl-theme')?.value === 'light' ? 'light' : 'dark';

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <Providers initialTheme={theme}>{children}</Providers>
      </body>
    </html>
  );
}
