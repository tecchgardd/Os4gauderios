'use client';
import { useMemo, useRef, useState } from 'react';
import { restoreMedia, saveMediaUpload, signMediaUpload } from '@/app/(admin)/admin/actions';
import { MEDIA, SECTIONS, type MediaDef } from '@/lib/content/registry';
import type { MediaRow } from '@/lib/content/store';
import { mb } from '@/lib/format';
import { useToast, type Notify } from './Fields';
import { Icon } from './Icon';
import PageHeader from './PageHeader';

type Rows = Record<string, MediaRow>;

const TYPES = [
  { id: 'all', label: 'Tudo' },
  { id: 'image', label: 'Fotos' },
  { id: 'video', label: 'Vídeos' },
  { id: 'file', label: 'Arquivos' }
];
const ACCEPT = { image: 'image/jpeg,image/png,image/webp,image/avif,image/gif', video: 'video/mp4,video/webm,video/quicktime', file: '.zip,.pdf' };
const TYPE_LABEL = { image: 'Foto', video: 'Vídeo', file: 'Arquivo' };
const CHUNK = 20 * 1048576; // o Cloudinary recebe arquivos grandes em partes de 20 MB

function sendPart(url: string, body: FormData, headers: Record<string, string>, onProgress: (loaded: number) => void) {
  return new Promise<{ public_id?: string; error?: { message: string } }>(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = e => e.lengthComputable && onProgress(e.loaded);
    xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({ error: { message: 'Resposta inválida do Cloudinary.' } }); } };
    xhr.onerror = () => resolve({ error: { message: 'Falha de conexão durante o envio.' } });
    xhr.send(body);
  });
}

// envia direto para o Cloudinary com a assinatura gerada no servidor
async function uploadToCloudinary(target: { url: string; fields: Record<string, string | number> }, file: File, onProgress: (pct: number) => void) {
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let result: { public_id?: string; error?: { message: string } } = {};
  for (let start = 0; start < file.size || start === 0; start += CHUNK) {
    const end = Math.min(start + CHUNK, file.size);
    const body = new FormData();
    Object.entries(target.fields).forEach(([k, v]) => body.append(k, String(v)));
    body.append('file', file.slice(start, end), file.name);
    const headers: Record<string, string> = file.size > CHUNK ? { 'X-Unique-Upload-Id': uploadId, 'Content-Range': `bytes ${start}-${end - 1}/${file.size}` } : {};
    result = await sendPart(target.url, body, headers, loaded => onProgress(Math.round(((start + loaded) / file.size) * 100)));
    if (result.error) return result;
    if (end >= file.size) break;
  }
  return result;
}

function MediaCard({ def, row, onChange, notify }: { def: MediaDef; row?: MediaRow; onChange: (rows: Rows) => void; notify: Notify }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const src = row ? row.url : `/${def.thumb && def.type === 'image' ? def.thumb : def.default}`;
  const section = SECTIONS.find(s => s.id === def.section);

  async function send(file?: File) {
    if (!file) return;
    setProgress(0);
    const signed = await signMediaUpload(def.slot, file.name, file.size);
    if (!signed.ok) { setProgress(null); return notify(signed.error, 'error'); }
    const sent = await uploadToCloudinary(signed.data, file, setProgress);
    if (sent.error || !sent.public_id) { setProgress(null); return notify(sent.error?.message ?? 'Não foi possível enviar o arquivo.', 'error'); }
    const saved = await saveMediaUpload(def.slot, sent.public_id, file.name);
    setProgress(null);
    if (!saved.ok) return notify(saved.error, 'error');
    onChange(saved.data);
    notify(`“${def.label}” atualizado no site.`);
  }

  async function restore() {
    if (!confirm(`Voltar “${def.label}” para o arquivo original?`)) return;
    const r = await restoreMedia(def.slot);
    if (!r.ok) return notify(r.error, 'error');
    onChange(r.data);
    notify('Arquivo original restaurado.');
  }

  return (
    <article className={`adm-media adm-drop${row ? ' is-custom' : ''}${over ? ' is-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); send(e.dataTransfer.files[0]); }}>
      <div className="adm-media-thumb">
        {def.type === 'image' && <img src={src} alt="" loading="lazy" />}
        {def.type === 'video' && <video src={src} muted loop playsInline preload="metadata" onMouseEnter={e => e.currentTarget.play().catch(() => {})} onMouseLeave={e => e.currentTarget.pause()} />}
        {def.type === 'file' && <div className="adm-file"><b>{(row?.meta?.ext || def.default.split('.').pop() || '').toUpperCase()}</b>{row?.meta?.size ? mb(row.meta.size) : def.meta}</div>}
        <span className={`adm-badge${row ? ' adm-badge--custom' : ''}`}>{row ? 'Personalizado' : 'Original'}</span>
        <span className="adm-badge adm-badge--type">{TYPE_LABEL[def.type]}</span>
      </div>
      <div className="adm-media-body">
        <strong>{def.label}</strong>
        <small>{section?.label}{def.group ? ` · ${def.group}` : ''}{def.usage ? ` · ${def.usage}` : ''}</small>
        {row && <small>Enviado por @{row.updatedBy || '—'} · {row.meta?.original}{row.meta?.size ? ` · ${mb(row.meta.size)}` : ''}</small>}
      </div>
      {progress !== null && <div className="adm-progress" aria-label={`Enviando ${progress}%`}><i style={{ width: `${progress}%` }} /></div>}
      <div className="adm-media-actions">
        <input ref={input} type="file" hidden accept={def.accept || ACCEPT[def.type]} onChange={e => { send(e.target.files?.[0]); e.target.value = ''; }} />
        <button className="adm-btn adm-btn--sm adm-btn--gold" onClick={() => input.current?.click()} disabled={progress !== null}>
          {Icon.upload}{progress !== null ? `Enviando ${progress}%` : 'Substituir'}
        </button>
        {row && <button className="adm-btn adm-btn--sm" onClick={restore} title="Voltar ao original">{Icon.undo}Original</button>}
      </div>
    </article>
  );
}

export default function Media({ initial, ready }: { initial: Rows; ready: boolean }) {
  const [rows, setRows] = useState(initial);
  const [section, setSection] = useState('all');
  const [type, setType] = useState('all');
  const [toast, notify] = useToast();

  const sections = SECTIONS.filter(s => MEDIA.some(m => m.section === s.id));
  const list = useMemo(() => MEDIA.filter(m => (section === 'all' || m.section === section) && (type === 'all' || m.type === type)), [section, type]);
  const count = (id: string) => MEDIA.filter(m => id === 'all' || m.section === id).length;

  return (
    <>
      <PageHeader title="Fotos e vídeos" eyebrow="Mídias do site"
        description="Escolha a seção, clique em Substituir (ou arraste o arquivo para o card). A troca vale na hora e o original fica guardado para restaurar quando quiser." />
      {toast}
      <div className="adm-toolbar">
        <div className="adm-tabs" role="group" aria-label="Seção do site">
          <button className={`adm-tab${section === 'all' ? ' is-active' : ''}`} onClick={() => setSection('all')}>Todas <sup>{count('all')}</sup></button>
          {sections.map(s => (
            <button key={s.id} className={`adm-tab${section === s.id ? ' is-active' : ''}`} onClick={() => setSection(s.id)} title={s.hint}>{s.label} <sup>{count(s.id)}</sup></button>
          ))}
        </div>
        <div className="adm-tabs" role="group" aria-label="Tipo">
          {TYPES.map(t => <button key={t.id} className={`adm-tab${type === t.id ? ' is-active' : ''}`} onClick={() => setType(t.id)}>{t.label}</button>)}
        </div>
      </div>
      {!ready && (
        <p className="adm-notice" style={{ marginBottom: 20 }}>
          <b>Cloudinary não configurado:</b> preencha CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no .env.local para poder trocar fotos e vídeos.
        </p>
      )}
      <p className="adm-notice" style={{ marginBottom: 20 }}>
        <b>Dica:</b> vídeos de fundo funcionam melhor em MP4 de até ~10 MB, sem som e com 8 a 15 segundos. Fotos sem fundo devem ser PNG ou WebP. Ao trocar um arquivo do kit de divulgação, o tamanho mostrado no site é atualizado sozinho; os pacotes ZIP precisam ser trocados à parte.
      </p>
      {list.length ? (
        <div className="adm-media-grid">
          {list.map(def => <MediaCard key={def.slot} def={def} row={rows[def.slot]} onChange={setRows} notify={notify} />)}
        </div>
      ) : <p className="adm-notice">Nenhuma mídia desse tipo nesta seção.</p>}
    </>
  );
}
