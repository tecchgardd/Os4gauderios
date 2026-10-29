// Usuários do painel: login por nome de usuário (sem e-mail) e senha, perfis admin e editor.
import 'server-only';
import { randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { db } from './db';
import { USERNAME_RE, type AdminUser, type Role } from './auth';
import type { Fields } from './content/store';

export type UserRow = { id: string; username: string; name: string; role: Role; createdAt: string };
type Result = { users: UserRow[] } | { errors: Fields } | { error: string };

// o Better Auth exige um e-mail único; este é interno e não aparece em lugar nenhum
export const internalEmail = (username: string) => `${username}@painel.local`;

export async function listUsers(): Promise<UserRow[]> {
  const rows = await db.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, username: true, name: true, role: true, createdAt: true } });
  return rows.map(u => ({ ...u, username: u.username ?? '', role: u.role === 'admin' ? 'admin' : 'editor', createdAt: u.createdAt.toISOString() }));
}

const adminCount = () => db.user.count({ where: { role: 'admin' } });

type Input = { username?: string; name?: string; password?: string; role?: string };

function validate(data: Input, creating: boolean) {
  const errors: Fields = {};
  if (creating && !USERNAME_RE.test(data.username ?? '')) errors.username = 'De 3 a 30 caracteres: letras minúsculas, números, ponto, hífen ou _';
  if (data.name !== undefined && !data.name.trim()) errors.name = 'Informe o nome';
  if ((creating || data.password) && (data.password ?? '').length < 8) errors.password = 'A senha precisa ter pelo menos 8 caracteres';
  if (data.role !== undefined && !['admin', 'editor'].includes(data.role)) errors.role = 'Perfil inválido';
  return errors;
}

// cria o usuário e a senha no formato do Better Auth (tabelas user + account)
export async function insertUser({ username, name, password, role }: { username: string; name: string; password: string; role: Role }) {
  const id = randomUUID();
  await db.user.create({
    data: {
      id, username, displayUsername: username, name, role, email: internalEmail(username), emailVerified: true,
      accounts: { create: { id: randomUUID(), accountId: id, providerId: 'credential', password: await hashPassword(password) } }
    }
  });
}

export async function createUser(input: Input): Promise<Result> {
  const data = {
    username: String(input.username ?? '').trim().toLowerCase(),
    name: String(input.name ?? '').trim().slice(0, 80),
    password: String(input.password ?? ''),
    role: (input.role === 'admin' ? 'admin' : 'editor') as Role
  };
  const errors = validate(data, true);
  if (!errors.username && await db.user.findUnique({ where: { username: data.username } })) errors.username = 'Esse usuário já existe';
  if (Object.keys(errors).length) return { errors };
  await insertUser(data);
  return { users: await listUsers() };
}

export async function updateUser(id: string, input: Input, actor: AdminUser): Promise<Result> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { error: 'Usuário não encontrado.' };
  const data: Input = {
    name: input.name !== undefined ? String(input.name).trim().slice(0, 80) : undefined,
    password: input.password ? String(input.password) : '',
    role: input.role
  };
  const errors = validate(data, false);
  if (data.role && data.role !== user.role && user.role === 'admin' && await adminCount() <= 1) errors.role = 'É preciso ter pelo menos um administrador';
  if (data.role && actor.id === id && data.role !== user.role) errors.role = 'Você não pode mudar o seu próprio perfil';
  if (Object.keys(errors).length) return { errors };

  await db.user.update({ where: { id }, data: { ...(data.name ? { name: data.name } : {}), ...(data.role ? { role: data.role } : {}) } });
  if (data.password) {
    await db.account.updateMany({ where: { userId: id, providerId: 'credential' }, data: { password: await hashPassword(data.password) } });
    // senha trocada pelo administrador: a pessoa precisa entrar de novo
    if (actor.id !== id) await db.session.deleteMany({ where: { userId: id } });
  }
  return { users: await listUsers() };
}

export async function deleteUser(id: string, actor: AdminUser): Promise<Result> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { error: 'Usuário não encontrado.' };
  if (actor.id === id) return { error: 'Você não pode excluir o seu próprio usuário.' };
  if (user.role === 'admin' && await adminCount() <= 1) return { error: 'É preciso ter pelo menos um administrador.' };
  await db.user.delete({ where: { id } }); // sessões e senha saem junto (cascade): perde o acesso na hora
  return { users: await listUsers() };
}
