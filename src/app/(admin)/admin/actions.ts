'use server';
// Ações do painel (server actions). Todas conferem o login antes de mexer em qualquer coisa.
import { headers } from 'next/headers';
import { auth, getCurrentUser, type AdminUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { MEDIA, type Profile } from '@/lib/content/registry';
import { cleanShow, getAgenda, getMediaRows, saveProfile, saveTexts, type Fields, type Show } from '@/lib/content/store';
import { ALLOWED, MAX_MB, cloudType, fetchUploaded, removeUploaded, signUpload, slotPrefix, uploadReady } from '@/lib/upload';
import { createUser, deleteUser, updateUser } from '@/lib/users';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fields?: Fields };

const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data });
const fail = (error: string, fields?: Fields): ActionResult<never> => ({ ok: false, error, fields });
const invalid = (fields: Fields) => fail('Confira os campos destacados.', fields);

async function guard<T>(fn: (user: AdminUser) => Promise<ActionResult<T>>, { admin = false } = {}): Promise<ActionResult<T>> {
  const user = await getCurrentUser();
  if (!user) return fail('Sua sessão terminou. Entre de novo.');
  if (admin && user.role !== 'admin') return fail('Apenas administradores.');
  try {
    return await fn(user);
  } catch (err) {
    console.error(err);
    return fail('Erro inesperado no servidor.');
  }
}

/* ---------- perfil ---------- */
export const saveProfileAction = async (input: Profile) => guard(async () => {
  const r = await saveProfile(input);
  return 'errors' in r ? invalid(r.errors) : ok(r.profile);
});

/* ---------- textos ---------- */
export const saveTextsAction = async (values: Record<string, string>) =>
  guard(async user => ok(await saveTexts(values, user.username)));

/* ---------- mídias ---------- */
const MEDIA_DEFS = new Map(MEDIA.map(m => [m.slot, m]));

// 1) o navegador pede uma assinatura para enviar o arquivo direto ao Cloudinary
export const signMediaUpload = async (slot: string, filename: string, size: number) => guard(async () => {
  const def = MEDIA_DEFS.get(slot);
  if (!def) return fail('Espaço de mídia desconhecido.');
  if (!uploadReady()) return fail('O Cloudinary ainda não foi configurado (CLOUDINARY_* no .env.local).');
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED[def.type].includes(ext)) return fail(`Formato não aceito aqui. Use: ${ALLOWED[def.type].map(e => `.${e}`).join(', ')}`);
  if (size > MAX_MB[def.type] * 1048576) return fail(`Arquivo grande demais. Limite: ${MAX_MB[def.type]} MB.`);
  return ok(signUpload(def, ext));
});

// 2) depois do envio, o servidor confere o arquivo no Cloudinary e coloca no site
export const saveMediaUpload = async (slot: string, publicId: string, original: string) => guard(async user => {
  const def = MEDIA_DEFS.get(slot);
  if (!def) return fail('Espaço de mídia desconhecido.');
  if (!publicId.startsWith(slotPrefix(def))) return fail('Arquivo enviado não confere.');
  const type = cloudType(def.type);
  const file = await fetchUploaded(publicId, type);
  const meta = { ext: file.format.toLowerCase(), size: file.bytes, width: file.width, height: file.height, original: original.split(/[\\/]/).pop()?.slice(0, 160) };

  const previous = await db.media.findUnique({ where: { slot } });
  await db.media.upsert({
    where: { slot },
    create: { slot, url: file.url, publicId, type, meta, updatedBy: user.username },
    update: { url: file.url, publicId, type, meta, updatedBy: user.username }
  });
  if (previous && previous.publicId !== publicId) await removeUploaded(previous.publicId, previous.type);
  return ok(await getMediaRows());
});

// volta para o arquivo original (de public/assets) e apaga o enviado
export const restoreMedia = async (slot: string) => guard(async () => {
  if (!MEDIA_DEFS.has(slot)) return fail('Espaço de mídia desconhecido.');
  const row = await db.media.findUnique({ where: { slot } });
  if (row) {
    await db.media.delete({ where: { slot } });
    await removeUploaded(row.publicId, row.type);
  }
  return ok(await getMediaRows());
});

/* ---------- agenda ---------- */
export const saveShow = async (input: Partial<Show>) => guard(async () => {
  const { show, errors } = cleanShow(input);
  if (Object.keys(errors).length) return invalid(errors);
  if (input.id) {
    const r = await db.show.updateMany({ where: { id: Number(input.id) }, data: show });
    if (!r.count) return fail('Show não encontrado.');
  } else {
    await db.show.create({ data: show });
  }
  return ok(await getAgenda());
});

export const deleteShow = async (id: number) => guard(async () => {
  await db.show.deleteMany({ where: { id: Number(id) } });
  return ok(await getAgenda());
});

/* ---------- usuários (só administradores) ---------- */
type UserInput = { username?: string; name?: string; password?: string; role?: string };

const userReply = (r: Awaited<ReturnType<typeof createUser>>) =>
  'errors' in r ? invalid(r.errors) : 'error' in r ? fail(r.error) : ok(r.users);

export const createUserAction = async (input: UserInput) => guard(async () => userReply(await createUser(input)), { admin: true });
export const updateUserAction = async (id: string, input: UserInput) => guard(async user => userReply(await updateUser(id, input, user)), { admin: true });
export const deleteUserAction = async (id: string) => guard(async user => userReply(await deleteUser(id, user)), { admin: true });

/* ---------- minha senha ---------- */
export const changeOwnPassword = async (current: string, password: string) => guard(async () => {
  if (String(password).length < 8) return fail('A nova senha precisa ter pelo menos 8 caracteres.', { password: 'Mínimo de 8 caracteres' });
  try {
    await auth.api.changePassword({ body: { currentPassword: current, newPassword: password, revokeOtherSessions: false }, headers: await headers() });
  } catch {
    return fail('Senha atual incorreta.', { current: 'Senha atual incorreta' });
  }
  return ok(true);
});
