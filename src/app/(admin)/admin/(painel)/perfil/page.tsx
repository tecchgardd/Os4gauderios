import type { Metadata } from 'next';
import Profile from '@/components/admin/Profile';
import { getProfile } from '@/lib/content/store';

export const metadata: Metadata = { title: 'Perfil da empresa' };

export default async function PerfilPage() {
  return <Profile initial={await getProfile()} />;
}
