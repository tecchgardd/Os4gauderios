'use client';
// Moldura do painel: menu lateral, usuário logado e botão Sair.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import type { AdminUser } from '@/lib/auth';
import { Icon } from './Icon';
import { NAV } from './nav';

export default function Shell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [pathname]);

  async function signOut() {
    await authClient.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className={`adm-shell${menu ? ' is-menu' : ''}`}>
      <button className="adm-btn adm-btn--sm adm-menu-btn" onClick={() => setMenu(!menu)} aria-expanded={menu}>{menu ? 'Fechar' : 'Menu'}</button>
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <img src="/assets/web/img/brasao-sm.webp" alt="" />
          <div><strong>Os <b>4</b> Gaudérios</strong><span>Painel</span></div>
        </Link>
        <nav className="adm-nav" aria-label="Módulos do painel">
          {NAV.filter(n => !n.admin || user.role === 'admin').map(n => (
            <Link key={n.href} href={n.href} className={pathname === n.href ? 'is-active' : ''}>
              {Icon[n.icon]}{n.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <div className="adm-me">
            <span className="adm-avatar">{(user.name || user.username).slice(0, 1).toUpperCase()}</span>
            <div><strong>{user.name}</strong><small>@{user.username} · {user.role === 'admin' ? 'Administrador' : 'Editor'}</small></div>
          </div>
          <a className="adm-btn adm-btn--sm" href="/" target="_blank" rel="noopener">{Icon.site} Ver o site</a>
          <button className="adm-btn adm-btn--sm adm-btn--ghost" onClick={signOut}>{Icon.out} Sair</button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
