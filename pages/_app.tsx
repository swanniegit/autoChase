import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import AppShell from '@/components/layout/AppShell';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppShell>
      <Component {...pageProps} />
    </AppShell>
  );
}

