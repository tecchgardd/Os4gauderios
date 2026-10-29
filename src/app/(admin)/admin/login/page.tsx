import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Entrar' };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/admin');
  return (
    <div className="adm-login">
      <div className="adm-login-box">
        <img src="/assets/web/img/brasao.webp" alt="Os 4 Gaudérios" />
        <h1>Painel do site</h1>
        <p>Entre com o seu usuário e senha.</p>
        <Suspense><LoginForm /></Suspense>
      </div>
    </div>
  );
}
