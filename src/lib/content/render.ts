// Monta o HTML do site a partir de template.html + o conteúdo salvo no painel.
import 'server-only';
import fs from 'fs';
import path from 'path';
import { CLIPS, LINKS, MEDIA, TEXTS, type MediaDef } from './registry';
import { getAgenda, getMediaRows, getProfile, getTexts, type MediaRow } from './store';
import { asDownload } from '../upload';
import { esc, mb } from '../format';

const TEMPLATE = path.join(process.cwd(), 'src', 'lib', 'content', 'template.html');
const TEXT_DEFS = new Map(TEXTS.map(t => [t.key, t]));
const MEDIA_DEFS = new Map(MEDIA.map(m => [m.slot, m]));

let cached: string | undefined;
const template = () => (process.env.NODE_ENV === 'production' ? (cached ??= fs.readFileSync(TEMPLATE, 'utf8')) : fs.readFileSync(TEMPLATE, 'utf8'));

// *texto* vira <em>, quebra de linha vira <br>
const rich = (v: string) => esc(v).replace(/\*([^*\n]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
const plainText = (v: string) => esc(String(v).replace(/\*/g, '')).replace(/\n/g, ' ');

function metaLabel(def: MediaDef, row?: MediaRow) {
  if (!row) return def.meta ?? '';
  const m = row.meta ?? {};
  if (def.metaFormat === 'size') return mb(m.size ?? 0);
  if (def.metaFormat === 'zip') return `ZIP ${mb(m.size ?? 0)}`;
  return [m.ext?.toUpperCase(), m.width && `${m.width}×${m.height}`, m.size && mb(m.size)].filter(Boolean).join(' · ');
}

function spotifyEmbed(url: string) {
  const m = String(url || '').match(/open\.spotify\.com\/(playlist|album|artist|track)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&amp;theme=0`
    : 'https://open.spotify.com/embed/playlist/2GgI7gHwBuifjeRIqPCsfA?utm_source=generator&amp;theme=0';
}

function buildBlocks(texts: Record<string, string>): Record<string, string> {
  const stat = (n: number) => {
    const value = texts[`stat_${n}_value`], label = esc(texts[`stat_${n}_label`]);
    const num = /^\d+$/.test(value);
    if (n === 1 && num) return `<div class="stat"><strong data-count="${value}" data-from="${Math.max(0, Number(value) - 47)}">${value}</strong><span>${label}</span></div>`;
    return num ? `<div class="stat"><strong><b data-count="${value}">${value}</b></strong><span>${label}</span></div>`
      : `<div class="stat"><strong>${esc(value)}</strong><span>${label}</span></div>`;
  };
  const row = (items: string[]) => items.map(i => `<span>${esc(i)}</span><i>✦</i>`).join('');
  const twice = (items: string[]) => `\n      ${row(items)}\n      ${row(items)}\n    `;
  const songs = texts.music_marquee.split('\n').map(s => s.trim()).filter(Boolean);
  return {
    stats: `\n    ${[1, 2, 3, 4].map(stat).join('\n    ')}\n  `,
    marquee1: twice(CLIPS.map(c => texts[`clip_${c.n}_title`])),
    marquee2: twice(songs.length ? songs : [' '])
  };
}

export async function renderSite() {
  const [profile, texts, media, agenda] = await Promise.all([getProfile(), getTexts(), getMediaRows(), getAgenda()]);
  const blocks = buildBlocks(texts);
  const url = (slot: string) => {
    const def = MEDIA_DEFS.get(slot)!, row = media[slot];
    if (!row) return def.default;
    return def.section === 'divulgacao' && row.type !== 'raw' ? asDownload(row.url) : row.url;
  };

  let html = template().replace(/\{\{([a-z]+):?([a-z0-9_]*)\}\}/gi, (all, kind: string, key: string) => {
    switch (kind) {
      case 't': return TEXT_DEFS.get(key)!.plain ? esc(texts[key]).replace(/\n/g, ' ') : rich(texts[key]);
      case 'ta': return plainText(texts[key]);
      case 'm': return esc(url(key));
      case 'mt': return esc(media[key] ? url(key) : MEDIA_DEFS.get(key)!.thumb ?? '');
      case 'mm': return esc(metaLabel(MEDIA_DEFS.get(key)!, media[key]));
      case 'p': return esc(String(profile[key as keyof typeof profile] ?? ''));
      case 'pu': return encodeURIComponent((profile.contact_name || '').split(' ')[0]);
      case 'block': return blocks[key];
      case 'spotify': return spotifyEmbed(profile.links.spotify); // {{spotify_embed}}
      default: return all;
    }
  });

  // links: o que estiver preenchido no perfil substitui o link padrão em todo o site
  for (const l of LINKS) {
    const custom = profile.links[l.key];
    if (custom && custom !== l.fallback) html = html.split(`href="${l.fallback}"`).join(`href="${esc(custom)}"`);
  }
  if (profile.pastaClipes) html = html.replace(/(<a class="btn btn-ghost magnetic" id="clipsFolder" href=")[^"]*/, `$1${esc(profile.pastaClipes)}`);

  // o mesmo objeto que o js/config.js definia, agora vindo do banco
  const SITE = {
    links: { ...Object.fromEntries(LINKS.map(l => [l.key, profile.links[l.key] || ''])), whatsapp: `https://wa.me/${profile.whatsapp}` },
    pastaClipes: profile.pastaClipes,
    agendaIlustrativa: !!profile.agendaIlustrativa
  };
  const AGENDA = agenda.map(({ id, ...s }) => Object.fromEntries(Object.entries(s).filter(([, v]) => v)));

  return {
    html,
    seo: { title: texts.seo_title, description: texts.seo_description },
    logo: url('logo'),
    boot: `window.SITE=${JSON.stringify(SITE)};window.AGENDA=${JSON.stringify(AGENDA)};`.replace(/</g, '\\u003c')
  };
}
