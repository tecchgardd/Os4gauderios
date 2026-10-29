import Link from 'next/link';
import { Icon } from '@/components/admin/Icon';
import PageHeader from '@/components/admin/PageHeader';
import { requireUser } from '@/lib/auth';
import { MEDIA, TEXTS } from '@/lib/content/registry';
import { getAgenda, getMediaRows, getTexts } from '@/lib/content/store';
import { today } from '@/lib/format';

export default async function Dashboard() {
  const user = await requireUser();
  const [media, texts, agenda] = await Promise.all([getMediaRows(), getTexts(), getAgenda()]);
  const stats = {
    media: Object.keys(media).length,
    texts: TEXTS.filter(t => texts[t.key] !== t.default).length,
    upcoming: agenda.filter(s => s.data >= today()).length
  };
  const modules = [
    { href: '/admin/perfil', icon: 'profile', title: 'Perfil da empresa', text: 'Contatos, WhatsApp, redes sociais e plataformas de música.' },
    { href: '/admin/midias', icon: 'media', title: 'Fotos e vídeos', text: `${stats.media} de ${MEDIA.length} mídias personalizadas`, stat: stats.media },
    { href: '/admin/textos', icon: 'text', title: 'Textos do site', text: `${stats.texts} de ${TEXTS.length} textos alterados`, stat: stats.texts },
    { href: '/admin/agenda', icon: 'calendar', title: 'Agenda', text: `${stats.upcoming} ${stats.upcoming === 1 ? 'show futuro' : 'shows futuros'}`, stat: stats.upcoming },
    ...(user.role === 'admin' ? [{ href: '/admin/usuarios', icon: 'users', title: 'Usuários', text: 'Quem pode entrar no painel.', stat: undefined }] : [])
  ];

  return (
    <>
      <PageHeader title={`Olá, ${user.name.split(' ')[0]}`} eyebrow="Painel" description="Tudo que você altera aqui aparece no site na hora. O layout e as animações continuam os mesmos." />
      <div className="adm-modules">
        {modules.map(m => (
          <Link key={m.href} href={m.href} className="adm-module">
            {Icon[m.icon]}
            {m.stat !== undefined && <span className="adm-stat">{m.stat}</span>}
            <h3>{m.title}</h3>
            <p>{m.text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
