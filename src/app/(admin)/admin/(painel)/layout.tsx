// Tudo dentro de (painel) exige login.
import type { ReactNode } from 'react';
import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <Shell user={user}>{children}</Shell>;
}
