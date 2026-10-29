// Configuração do Prisma. Lê o DATABASE_URL do .env / .env.local (mesma regra do Next).
import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'prisma/config';

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' }
});
