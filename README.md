# Os 4 Gaudérios: site e painel

Site em **Next.js 15 (App Router) com TypeScript** e painel administrativo em `/admin`. O visual, o layout e as animações são os mesmos da versão em HTML. Textos, links, fotos, vídeos e agenda são editados pelo painel.

| Peça | Serviço |
|---|---|
| Banco de dados | **Postgres no Neon**, acessado pelo **Prisma** |
| Login | **Better Auth**, com usuário e senha (sem e-mail e sem cadastro público) |
| Fotos e vídeos enviados pelo painel | **Cloudinary**: o navegador envia direto, em partes de 20 MB |

## Começar

1. Copie `.env.example` para `.env.local` e preencha:
   - `DATABASE_URL`: no painel do Neon, em **Connect → Pooled connection**.
   - `BETTER_AUTH_SECRET`: se ficar vazio, o `npm run setup` gera um.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`: no painel do Cloudinary, em **Settings → API Keys**.
2. Rode:
   ```bash
   npm install
   npm run setup     # cria as tabelas no Neon, importa a agenda e cria o primeiro administrador
   npm run dev       # http://localhost:3000  e  http://localhost:3000/admin
   ```

Para escolher usuário e senha do primeiro administrador:

```bash
ADMIN_USER=gilberto ADMIN_PASSWORD="umaSenhaForte" npm run setup
```

Sem isso, é criado o acesso de demonstração **admin / admin**. Troque a senha em **Minha senha** antes de divulgar o site.

## Estrutura

```
prisma/
  schema.prisma              tabelas: login (Better Auth) + perfil, textos, mídias e agenda
  migrations/                histórico do banco (aplicado com npm run db:migrate)
public/                      arquivos estáticos (o Next exige essa pasta na raiz)
  assets/                    logos, fotos, vídeos e kit de divulgação originais (inalterados)
  js/main.js                 animações do site (GSAP + Lenis)
src/
  app/
    (site)/                  site público
      layout.tsx · page.tsx · site.css
    (admin)/admin/           painel
      layout.tsx · admin.css
      actions.ts             ações do painel (salvar, enviar mídia, usuários…), todas conferem o login
      login/                 tela de login
      (painel)/              telas que exigem login: início, perfil, mídias, textos, agenda, usuários, conta
    api/auth/[...all]/       rotas do Better Auth
  components/admin/          telas e componentes do painel (Shell, Fields, Media, Texts, Agenda…)
  lib/
    content/
      registry.ts            lista de tudo que é editável + valores originais
      store.ts               leitura e gravação no banco
      render.ts              preenche o template com o conteúdo salvo
      template.html          HTML do site com os marcadores {{...}}
    auth.ts · auth-client.ts Better Auth (servidor e navegador)
    db.ts                    Prisma (Neon)
    upload.ts                Cloudinary
    users.ts                 regras de usuários
    format.ts                formatação compartilhada
  middleware.ts              manda para o login quem abre o painel sem sessão
  generated/prisma/          cliente do Prisma (gerado, fora do git)
scripts/                     setup.ts e build-template.ts
legacy/                      HTML original (index-static.html é a base do template)
```

Imports usam o atalho `@/`, por exemplo `import { getProfile } from '@/lib/content/store'`.

Se o HTML original em `legacy/index-static.html` for alterado, rode `npm run template` para gerar de novo o `src/lib/content/template.html`.

## Painel (`/admin`)

| Módulo | O que edita |
|---|---|
| **Perfil da empresa** | Contato, WhatsApp, telefone, e-mail, produtora, cidade, @ do Instagram, links das redes sociais e das plataformas de música, pasta dos clipes em 4K, modo demonstração da agenda |
| **Fotos e vídeos** | Cada foto, vídeo e arquivo do site, por seção e por tipo. Para substituir, clique no card ou arraste o arquivo; o original pode ser restaurado a qualquer momento |
| **Textos do site** | Todos os textos, separados por seção. `*texto*` vira o destaque em itálico dourado e Enter quebra a linha |
| **Agenda** | Adicionar, editar e excluir shows |
| **Usuários** | Só administradores. Login por **usuário e senha**. Perfis: Administrador e Editor |
| **Minha senha** | Cada pessoa troca a própria senha |

**Segurança:**
- O cadastro público e as rotas de e-mail ficam desligados.
- A sessão dura 8 horas.
- O login aceita até 10 tentativas a cada 15 minutos por IP.
- Toda ação do painel confere a sessão no banco. Um usuário excluído perde o acesso na hora.

**Por que existe um e-mail interno:** o Better Auth exige um e-mail em cada usuário. O painel grava `usuario@painel.local`, que ninguém vê nem usa para entrar.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | modo desenvolvimento |
| `npm run build` / `npm start` | versão de produção |
| `npm run setup` | primeira configuração (tabelas, agenda, primeiro admin) |
| `npm run db:migrate` | aplica mudanças do `prisma/schema.prisma` no Neon |
| `npm run db:studio` | abre o Prisma Studio para ver o banco |
| `npm run lint` | confere os tipos do TypeScript |
| `npm run template` | gera o template do site a partir de `legacy/index-static.html` |

## Colocar no servidor (VPS)

1. Envie o projeto **sem** `node_modules`, `.next` e `public/assets/clipes` (os vídeos originais de ~4,6 GB não são usados pelo site).
2. No servidor (Node 20.19 ou mais novo), crie o `.env.local` com as variáveis de produção. Use `BETTER_AUTH_URL` com o endereço do site, por exemplo `https://os4gauderios.com.br`.
3. Rode:
   ```bash
   npm install
   ADMIN_USER=gilberto ADMIN_PASSWORD="umaSenhaForte" npm run setup
   npm run build
   npm start          # porta 3000
   ```
4. Use PM2 ou systemd para manter o site rodando, com Nginx na frente e HTTPS. Os vídeos vão direto para o Cloudinary, então o Nginx não precisa de limite alto de upload.
5. **Backup:** o Neon guarda o histórico do banco e o Cloudinary guarda as mídias. Não há pasta local para copiar.

## Antes de divulgar

- Desligar o **modo demonstração da agenda** em Perfil da empresa.
- Conferir o plano do Cloudinary. O gratuito aceita até 10 MB por foto e por arquivo ZIP/PDF, e até 100 MB por vídeo. O ZIP dos clipes (~70 MB) precisa de um plano pago, ou deve continuar como o arquivo original.
- Os pacotes ZIP do kit de divulgação não se atualizam sozinhos: se trocar fotos do kit, envie um ZIP novo em Fotos e vídeos → Divulgação.
