import type { Metadata } from 'next';
import Texts from '@/components/admin/Texts';
import { getTexts } from '@/lib/content/store';

export const metadata: Metadata = { title: 'Textos do site' };

export default async function TextosPage() {
  return <Texts initial={await getTexts()} />;
}
