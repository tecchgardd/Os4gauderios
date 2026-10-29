import type { Metadata } from 'next';
import Agenda from '@/components/admin/Agenda';
import { getAgenda, getProfile } from '@/lib/content/store';

export const metadata: Metadata = { title: 'Agenda' };

export default async function AgendaPage() {
  const [agenda, profile] = await Promise.all([getAgenda(), getProfile()]);
  return <Agenda initial={agenda} demo={!!profile.agendaIlustrativa} />;
}
