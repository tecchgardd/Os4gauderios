// Site público. O HTML vem de lib/content/template.html preenchido com o que foi salvo no painel;
// as animações continuam em public/js/main.js (GSAP + Lenis), exatamente como na versão em HTML.
import type { Metadata } from 'next';
import { cache } from 'react';
import { preload } from 'react-dom';
import { renderSite } from '@/lib/content/render';

export const dynamic = 'force-dynamic';

const getSite = cache(renderSite);

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSite();
  return { title: seo.title, description: seo.description };
}

export default async function SitePage() {
  const { html, logo, boot } = await getSite();
  preload(logo, { as: 'image' });
  return (
    <>
      <div id="site" dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" />
      <script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" />
      <script dangerouslySetInnerHTML={{ __html: boot }} />
      <script src="/js/main.js" />
    </>
  );
}
