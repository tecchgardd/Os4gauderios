import type { Metadata } from 'next';
import Accounts from '@/components/admin/Accounts';
import { requireUser } from '@/lib/auth';
import { listUsers } from '@/lib/users';

export const metadata: Metadata = { title: 'Usuários' };

export default async function UsuariosPage() {
  const user = await requireUser({ admin: true });
  return <Accounts user={user} initial={await listUsers()} />;
}
