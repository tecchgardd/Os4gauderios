import type { Metadata } from 'next';
import Password from '@/components/admin/Password';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Minha senha' };

export default async function ContaPage() {
  const user = await requireUser();
  return <Password username={user.username} />;
}
