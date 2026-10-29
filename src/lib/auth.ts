// Login do painel com Better Auth: usuário e senha, sem e-mail e sem cadastro público.
import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { username } from 'better-auth/plugins';
import { db } from './db';

export const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;

export const auth = betterAuth({
  appName: 'Painel Os 4 Gaudérios',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: 'postgresql' }),
  // no "npm run dev" o Next muda de porta se a 3000 estiver ocupada (3001, 3002…)
  trustedOrigins: process.env.NODE_ENV === 'development'
    ? Array.from({ length: 11 }, (_, i) => `http://localhost:${3000 + i}`)
    : [],
  emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 8, maxPasswordLength: 128 },
  // só existe o login por usuário; as rotas de e-mail ficam desligadas
  disabledPaths: ['/sign-in/email', '/sign-up/email', '/request-password-reset', '/reset-password', '/change-email'],
  user: {
    additionalFields: { role: { type: 'string', required: false, defaultValue: 'editor', input: false } }
  },
  session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 60 },
  // proteção contra força bruta: 10 tentativas de login a cada 15 minutos por IP
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: { '/sign-in/username': { window: 15 * 60, max: 10 } }
  },
  plugins: [
    username({ minUsernameLength: 3, maxUsernameLength: 30, usernameValidator: u => USERNAME_RE.test(u) }),
    nextCookies()
  ]
});

export type Role = 'admin' | 'editor';
export type AdminUser = { id: string; username: string; name: string; role: Role };

// usuário logado (lido do banco a cada requisição: excluído ou rebaixado perde o acesso na hora)
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user;
  return { id: u.id, username: u.username ?? '', name: u.name, role: u.role === 'admin' ? 'admin' : 'editor' };
});

// para páginas do painel: sem login vai para a tela de login
export async function requireUser({ admin = false } = {}): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (admin && user.role !== 'admin') redirect('/admin');
  return user;
}
