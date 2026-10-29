/*
  Primeira configuração do painel.
    npm run setup
  - confere o .env.local (cria a chave BETTER_AUTH_SECRET se faltar)
  - cria as tabelas no Postgres do Neon (prisma migrate deploy)
  - importa a agenda de public/js/agenda.js (só se a agenda estiver vazia)
  - cria o primeiro administrador

  Usuário e senha do primeiro admin podem vir do ambiente:
    ADMIN_USER=gilberto ADMIN_PASSWORD="umaSenhaForte" npm run setup
  Sem isso, cria o acesso de demonstração: usuário "admin", senha "admin".
*/
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { loadEnvConfig } from '@next/env';

const ROOT = process.cwd();
const envFile = path.join(ROOT, '.env.local');

// 1. .env.local
let env = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
if (!/^BETTER_AUTH_SECRET=".+"/m.test(env)) {
  const line = `BETTER_AUTH_SECRET="${crypto.randomBytes(32).toString('base64')}"`;
  env = /^BETTER_AUTH_SECRET=.*$/m.test(env) ? env.replace(/^BETTER_AUTH_SECRET=.*$/m, line) : `${env.trimEnd()}\n${line}\n`;
}
fs.writeFileSync(envFile, env);
loadEnvConfig(ROOT);
if (!process.env.DATABASE_URL) {
  console.error('✗ Falta o DATABASE_URL no .env.local (endereço do Postgres do Neon).');
  process.exit(1);
}
console.log('✓ .env.local pronto');

async function main() {
  // 2. tabelas
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✓ tabelas do banco prontas');

  const { db } = await import('../src/lib/db');
  const { hashPassword } = await import('better-auth/crypto');

  // 3. agenda
  if (await db.show.count() === 0) {
    const sandbox: { window: { AGENDA?: Record<string, string>[] } } = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'public', 'js', 'agenda.js'), 'utf8'), sandbox);
    const shows = sandbox.window.AGENDA ?? [];
    await db.show.createMany({
      data: shows.map(s => ({ data: s.data, hora: s.hora ?? '', cidade: s.cidade, uf: s.uf, evento: s.evento, local: s.local ?? '', link: s.link ?? '', status: s.status ?? '' }))
    });
    console.log(`✓ agenda importada: ${shows.length} shows`);
  } else {
    console.log('✓ agenda já existe no banco (não importada de novo)');
  }

  // 4. primeiro administrador
  if (await db.user.count({ where: { role: 'admin' } }) > 0) {
    console.log('✓ já existe administrador. Nenhum usuário criado.');
  } else {
    const username = (process.env.ADMIN_USER || 'admin').trim().toLowerCase();
    // sem ADMIN_PASSWORD: acesso de demonstração admin / admin (troque em "Minha senha")
    const demo = !process.env.ADMIN_PASSWORD;
    const password = process.env.ADMIN_PASSWORD || 'admin';
    if (!/^[a-z0-9._-]{3,30}$/.test(username)) throw new Error('ADMIN_USER: de 3 a 30 caracteres (letras minúsculas, números, ponto, hífen ou _).');
    if (!demo && password.length < 8) throw new Error('ADMIN_PASSWORD precisa ter pelo menos 8 caracteres.');
    const id = crypto.randomUUID();
    // mesmo formato que o Better Auth usa (ver src/lib/users.ts)
    await db.user.create({
      data: {
        id, username, displayUsername: username, name: 'Administrador', role: 'admin', email: `${username}@painel.local`, emailVerified: true,
        accounts: { create: { id: crypto.randomUUID(), accountId: id, providerId: 'credential', password: await hashPassword(password) } }
      }
    });
    console.log('\n✓ administrador criado');
    console.log(`  usuário: ${username}`);
    if (demo) console.log(`  senha:   ${password}   (acesso de demonstração: troque em "Minha senha" antes de divulgar)`);
  }
  await db.$disconnect();
  console.log('\nPronto. Rode "npm run dev" e acesse http://localhost:3000/admin');
}

main().catch(err => {
  console.error('✗', err.message ?? err);
  process.exit(1);
});
