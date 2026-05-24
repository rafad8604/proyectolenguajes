import './global.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from 'components/layout/navbar';
import { Footer } from 'components/layout/footer';
import { SkipLink } from 'components/layout/skip-link';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { cn } from 'lib/utils/cn';
import { baseUrl } from './sitemap';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Laboratorio de Lenguajes Formales',
    template: '%s | Laboratorio de Lenguajes Formales',
  },
  description:
    'Aplicación educativa para construir, simular y analizar autómatas, máquinas de Turing y gramáticas formales.',
  openGraph: {
    title: 'Laboratorio de Lenguajes Formales',
    description:
      'Herramienta interactiva para teoría de lenguajes: AFD, AFND, Turing, Thompson, gramáticas y lema de bombeo.',
    url: baseUrl,
    siteName: 'Laboratorio de Lenguajes Formales',
    locale: 'es_ES',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={cn(
        'text-neutral-900 bg-neutral-50 dark:text-neutral-100 dark:bg-neutral-950',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased min-h-screen">
        <SkipLink />
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <Navbar />
          <main id="contenido-principal" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
