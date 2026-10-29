// Layout raiz do painel (/admin). O CSS do painel usa só classes .adm-*.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './admin.css';

export const metadata: Metadata = {
  title: { template: '%s · Painel Os 4 Gaudérios', default: 'Painel Os 4 Gaudérios' },
  robots: { index: false, follow: false },
  icons: { icon: '/assets/web/img/icon.png' }
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="adm">{children}</div>
      </body>
    </html>
  );
}
