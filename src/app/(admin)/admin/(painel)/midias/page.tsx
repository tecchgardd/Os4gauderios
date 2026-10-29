import type { Metadata } from 'next';
import Media from '@/components/admin/Media';
import { getMediaRows } from '@/lib/content/store';
import { uploadReady } from '@/lib/upload';

export const metadata: Metadata = { title: 'Fotos e vídeos' };

export default async function MidiasPage() {
  return <Media initial={await getMediaRows()} ready={uploadReady()} />;
}
