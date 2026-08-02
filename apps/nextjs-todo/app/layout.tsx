import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Providers, type Theme } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Owl Todo — AuthOwl × Next.js',
  description:
    'A small, real todo app showing how little code it takes to add AuthOwl authentication to a Next.js App Router project.',
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
