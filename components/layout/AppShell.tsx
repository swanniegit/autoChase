import Head from 'next/head';
import Header from './Header';
import { PropsWithChildren } from 'react';

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <title>AutoChase</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="AutoChase - Automatic invoice reminders" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container-max py-8">{children}</main>
        <footer className="py-6 text-center text-sm text-slate-500">© {new Date().getFullYear()} AutoChase</footer>
      </div>
    </>
  );
}
