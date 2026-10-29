// Leitura e gravação do conteúdo editável no banco (sempre partindo dos valores originais do registro).
import 'server-only';
import { db } from '../db';
import { LINKS, PROFILE_DEFAULTS, TEXTS, type LinkKey, type Profile, type ShowStatus } from './registry';

export type Fields = Record<string, string>;

export type MediaRow = {
  slot: string;
  url: string;
  publicId: string;
  type: string;
  meta: { ext?: string; size?: number; width?: number; height?: number; original?: string } | null;
  updatedAt: string;
  updatedBy: string | null;
};

export type Show = {
  id: number; data: string; hora: string; cidade: string; uf: string;
  evento: string; local: string; link: string; status: ShowStatus;
};

const TEXT_DEFAULTS = new Map(TEXTS.map(t => [t.key, t.default]));
const isUrl = (v: string) => v === '' || /^https?:\/\/[^\s]+$/i.test(v);
const str = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max);

/* ---------- perfil ---------- */
export async function getProfile(): Promise<Profile> {
  const row = await db.setting.findUnique({ where: { key: 'profile' } });
  const saved = (row?.value ?? {}) as Partial<Profile>;
  return { ...PROFILE_DEFAULTS, ...saved, links: { ...PROFILE_DEFAULTS.links, ...(saved.links ?? {}) } };
}

export async function saveProfile(input: Partial<Profile>): Promise<{ profile: Profile } | { errors: Fields }> {
  const current = await getProfile();
  const next: Profile = {
    contact_name: str(input.contact_name, 80) || current.contact_name,
    whatsapp: str(input.whatsapp, 20).replace(/\D/g, ''),
    phone: str(input.phone, 40),
    email: str(input.email, 120),
    producer: str(input.producer, 120),
    city: str(input.city, 80),
    instagram_handle: str(input.instagram_handle, 60),
    pastaClipes: str(input.pastaClipes, 500),
    agendaIlustrativa: !!input.agendaIlustrativa,
    links: {} as Record<LinkKey, string>
  };
  const errors: Fields = {};
  if (!/^\d{10,15}$/.test(next.whatsapp)) errors.whatsapp = 'Use só números, com 55 e DDD. Ex.: 5554999170670';
  if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) errors.email = 'E-mail inválido';
  if (!isUrl(next.pastaClipes)) errors.pastaClipes = 'O link precisa começar com https://';
  for (const { key } of LINKS) {
    const v = str(input.links?.[key], 500);
    if (!isUrl(v)) errors[`links.${key}`] = 'O link precisa começar com https://';
    next.links[key] = v;
  }
  if (Object.keys(errors).length) return { errors };
  await db.setting.upsert({ where: { key: 'profile' }, create: { key: 'profile', value: next }, update: { value: next } });
  return { profile: await getProfile() };
}

/* ---------- textos ---------- */
export async function getTexts(): Promise<Record<string, string>> {
  const rows = await db.text.findMany();
  const saved = new Map(rows.map(r => [r.key, r.value]));
  return Object.fromEntries(TEXTS.map(t => [t.key, saved.get(t.key) ?? t.default]));
}

export async function saveTexts(values: Record<string, string>, username: string) {
  const ops = [];
  for (const [key, raw] of Object.entries(values ?? {})) {
    const def = TEXT_DEFAULTS.get(key);
    if (def === undefined) continue;
    const value = String(raw ?? '').replace(/\r\n/g, '\n').slice(0, 4000);
    // igual ao original (ou vazio) = volta a usar o original
    if (value === def || value.trim() === '') ops.push(db.text.deleteMany({ where: { key } }));
    else ops.push(db.text.upsert({ where: { key }, create: { key, value, updatedBy: username }, update: { value, updatedBy: username } }));
  }
  await db.$transaction(ops);
  return getTexts();
}

/* ---------- mídias ---------- */
export async function getMediaRows(): Promise<Record<string, MediaRow>> {
  const rows = await db.media.findMany();
  return Object.fromEntries(rows.map(r => [r.slot, { ...r, meta: r.meta as MediaRow['meta'], updatedAt: r.updatedAt.toISOString() }]));
}

/* ---------- agenda ---------- */
export async function getAgenda(): Promise<Show[]> {
  const rows = await db.show.findMany({ orderBy: [{ data: 'asc' }, { hora: 'asc' }, { id: 'asc' }] });
  return rows as Show[];
}

export function cleanShow(input: Partial<Show>) {
  const s = (v: unknown) => String(v ?? '').trim();
  const show = {
    data: s(input.data), hora: s(input.hora).slice(0, 10), cidade: s(input.cidade).slice(0, 80),
    uf: s(input.uf).toUpperCase().slice(0, 2), evento: s(input.evento).slice(0, 120),
    local: s(input.local).slice(0, 120), link: s(input.link).slice(0, 500), status: s(input.status) as ShowStatus
  };
  const errors: Fields = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(show.data)) errors.data = 'Informe a data';
  if (!show.cidade) errors.cidade = 'Informe a cidade';
  if (!/^[A-Z]{2}$/.test(show.uf)) errors.uf = 'UF com 2 letras';
  if (!show.evento) errors.evento = 'Informe o evento ou local';
  if (show.link && !isUrl(show.link)) errors.link = 'O link precisa começar com https://';
  if (!['', 'confirmado', 'ultimos', 'esgotado', 'fechado'].includes(show.status)) errors.status = 'Status inválido';
  return { show, errors };
}
