// Login no navegador (tela de login e botão Sair).
import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({ plugins: [usernameClient()] });
