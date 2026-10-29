'use client';
import { useMemo, useState } from 'react';
import { saveProfileAction } from '@/app/(admin)/admin/actions';
import { LINKS, type LinkDef, type LinkKey, type Profile as ProfileData } from '@/lib/content/registry';
import { Field, Input, SaveBar, Switch, useLeaveGuard, useToast } from './Fields';
import PageHeader from './PageHeader';

const BRAND: Record<LinkKey, string> = { instagram: '#E1306C', youtube: '#FF0033', facebook: '#3b82f6', tiktok: '#25F4EE', spotify: '#1DB954', youtubemusic: '#FF0033', deezer: '#A238FF', applemusic: '#FA243C', amazonmusic: '#25D1DA', palcomp3: '#F26522' };

function LinkField({ def, value, error, onChange }: { def: LinkDef; value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <Field label={def.label} error={error} hint={value ? null : 'Vazio: o botão abre a busca por “Os 4 Gaudérios” nessa plataforma.'}>
      <div className="adm-input-icon" style={{ '--brand': BRAND[def.key] } as React.CSSProperties}>
        <i className={`adm-ico adm-ico--${def.key}`} />
        <Input type="url" inputMode="url" placeholder="https://" value={value} error={error} onChange={e => onChange(e.target.value)} />
        <a className="adm-btn adm-btn--sm adm-test" href={value || def.fallback} target="_blank" rel="noopener">Testar ↗</a>
      </div>
    </Field>
  );
}

export default function Profile({ initial }: { initial: ProfileData }) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, notify] = useToast();
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  useLeaveGuard(dirty);

  const set = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => setForm(f => ({ ...f, [k]: v }));
  const setLink = (k: LinkKey, v: string) => setForm(f => ({ ...f, links: { ...f.links, [k]: v } }));

  async function save() {
    setSaving(true);
    const r = await saveProfileAction(form);
    setSaving(false);
    if (!r.ok) { setErrors(r.fields ?? {}); return notify(r.error, 'error'); }
    setErrors({});
    setSaved(r.data);
    setForm(r.data);
    notify('Perfil salvo. O site já foi atualizado.');
  }

  return (
    <>
      <PageHeader title="Perfil da empresa" eyebrow="Contatos e links" description="Esses dados aparecem em todos os botões de contato, no menu, no rodapé e nas seções de redes e plataformas." />
      {toast}
      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Contratações</h2><p>Quem atende e como falar com a produção.</p></div></div>
        <div className="adm-grid adm-grid--3">
          <Field label="Nome do contato" error={errors.contact_name} hint="Aparece como “WhatsApp · Nome” e na mensagem pronta">
            <Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
          </Field>
          <Field label="WhatsApp (só números)" error={errors.whatsapp} hint="Com 55 e DDD. Ex.: 5554999170670">
            <Input inputMode="numeric" value={form.whatsapp} error={errors.whatsapp} onChange={e => set('whatsapp', e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Telefone exibido" hint="Como o número aparece escrito no site">
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Field>
          <Field label="E-mail" error={errors.email}>
            <Input type="email" value={form.email} error={errors.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <Field label="Produtora">
            <Input value={form.producer} onChange={e => set('producer', e.target.value)} />
          </Field>
          <Field label="Cidade / UF">
            <Input value={form.city} onChange={e => set('city', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Redes sociais</h2><p>Para onde cada ícone e card de rede leva o visitante.</p></div></div>
        <div className="adm-grid adm-grid--2">
          <Field label="@ do Instagram (texto grande da seção Redes)">
            <Input value={form.instagram_handle} onChange={e => set('instagram_handle', e.target.value)} />
          </Field>
          <div />
          {LINKS.filter(l => l.group === 'redes').map(l => (
            <LinkField key={l.key} def={l} value={form.links[l.key]} error={errors[`links.${l.key}`]} onChange={v => setLink(l.key, v)} />
          ))}
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Plataformas de música</h2><p>Botão “Ouça onde quiser”, menu, rodapé e mini player. O link do Spotify também alimenta o player tocável.</p></div></div>
        <div className="adm-grid adm-grid--2">
          {LINKS.filter(l => l.group === 'plataformas').map(l => (
            <LinkField key={l.key} def={l} value={form.links[l.key]} error={errors[`links.${l.key}`]} onChange={v => setLink(l.key, v)} />
          ))}
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Outros ajustes</h2></div></div>
        <div className="adm-grid adm-grid--2">
          <Field label="Pasta dos clipes completos em 4K" error={errors.pastaClipes} hint="Google Drive, Dropbox… Vazio: o botão pede os clipes pelo WhatsApp.">
            <Input type="url" placeholder="https://" value={form.pastaClipes} error={errors.pastaClipes} onChange={e => set('pastaClipes', e.target.value)} />
          </Field>
          <Field label="Agenda" hint="Ligado: datas passadas aparecem como próximas, com o aviso “Datas ilustrativas”. Desligue antes de divulgar o site.">
            <Switch checked={form.agendaIlustrativa} onChange={v => set('agendaIlustrativa', v)}>Modo demonstração da agenda</Switch>
          </Field>
        </div>
      </section>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => { setForm(saved); setErrors({}); }} />
    </>
  );
}
