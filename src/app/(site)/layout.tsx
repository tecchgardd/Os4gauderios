// Layout raiz do site público: o mesmo <head> da versão em HTML.
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './site.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0806'
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Os 4 Gaudérios',
    description: 'Desde 1997 levando o fandango gaúcho para bailes, rodeios e festas.',
    images: ['/assets/web/img/og.jpg']
  },
  icons: { icon: '/assets/web/img/icon.png' }
};

export default function SiteRootLayout({ children }: { children: ReactNode }) {
  return (
    // as animações (public/js/main.js) mexem nas classes de <html> e <body>
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="is-loading" suppressHydrationWarning>{children}</body>
    </html>
  );
}
