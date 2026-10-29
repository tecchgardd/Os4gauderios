'use client';
import { useState } from 'react';
import { deleteShow, saveShow } from '@/app/(admin)/admin/actions';
import { AGENDA_STATUS } from '@/lib/content/registry';
import type { Show } from '@/lib/content/store';
import { brDate, today } from '@/lib/format';
import { Field, Input, Modal, useToast, type Notify } from './Fields';
import { Icon } from './Icon';
import PageHeader from './PageHeader';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const EMPTY: Partial<Show> = { data: '', hora: '', cidade: '', uf: '', evento: '', local: '', link: '', status: '' };
const STATUS_PILL: Record<string, string> = { confirmado: 'green', ultimos: 'gold', esgotado: 'red' };

function ShowForm({ show, onClose, onSaved, notify }: { show: Partial<Show>; onClose: () => void; onSaved: (a: Show[]) => void; notify: Notify }) {
  const [form, setForm] = useState({ ...EMPTY, ...show });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Show, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const r = await saveShow(form);
    setSaving(false);
    if (!r.ok) { setErrors(r.fields ?? {}); return notify(r.error, 'error'); }
    onSaved(r.data);
    notify(show.id ? 'Show atualizado.' : 'Show adicionado à agenda.');
  }

  return (
    <Modal title={show.id ? 'Editar show' : 'Novo show'} onClose={onClose}
      footer={<><button className="adm-btn adm-btn--ghost" onClick={onClose}>Cancelar</button><button className="adm-btn adm-btn--gold" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar show'}</button></>}>
      <div className="adm-grid adm-grid--3">
        <Field label="Data" error={errors.data}><Input type="date" value={form.data} error={errors.data} onChange={e => set('data', e.target.value)} /></Field>
        <Field label="Horário" hint="Ex.: 23h ou 21h30"><Input value={form.hora} placeholder="23h" onChange={e => set('hora', e.target.value)} /></Field>
        <Field label="Status">
          <select className="adm-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {AGENDA_STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Cidade" error={errors.cidade} className="adm-span-2"><Input value={form.cidade} error={errors.cidade} onChange={e => set('cidade', e.target.value)} /></Field>
        <Field label="UF" error={errors.uf}><Input value={form.uf} maxLength={2} error={errors.uf} onChange={e => set('uf', e.target.value.toUpperCase())} /></Field>
        <Field label="Evento / casa" error={errors.evento} className="adm-span-2"><Input value={form.evento} placeholder="CTG, salão, festa…" error={errors.evento} onChange={e => set('evento', e.target.value)} /></Field>
        <Field label="Local (opcional)"><Input value={form.local} onChange={e => set('local', e.target.value)} /></Field>
        <Field label="Link de ingressos (opcional)" error={errors.link} hint="Sem link: o botão abre o WhatsApp com a cidade e a data" className="adm-span-2">
          <Input type="url" placeholder="https://" value={form.link} error={errors.link} onChange={e => set('link', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

export default function Agenda({ initial, demo }: { initial: Show[]; demo: boolean }) {
  const [agenda, setAgenda] = useState(initial);
  const [editing, setEditing] = useState<Partial<Show> | null>(null);
  const [toast, notify] = useToast();
  const day = today();
  const future = agenda.filter(s => s.data >= day), past = agenda.filter(s => s.data < day).reverse();

  async function remove(s: Show) {
    if (!confirm(`Excluir o show de ${s.cidade} em ${brDate(s.data)}?`)) return;
    const r = await deleteShow(s.id);
    if (!r.ok) return notify(r.error, 'error');
    setAgenda(r.data);
    notify('Show excluído.');
  }

  const Row = ({ s, isPast }: { s: Show; isPast?: boolean }) => {
    const d = new Date(`${s.data}T12:00:00`);
    const st = AGENDA_STATUS.find(x => x.id === s.status);
    return (
      <div className={`adm-row${isPast ? ' is-past' : ''}`}>
        <div className="adm-date"><b>{String(d.getDate()).padStart(2, '0')}</b><span>{MESES[d.getMonth()]} · {DIAS[d.getDay()]}</span></div>
        <div>
          <h3>{s.cidade} · {s.uf}{s.status && <span className={`adm-pill adm-pill--${STATUS_PILL[s.status] || ''}`}>{st?.label}</span>}{isPast && <span className="adm-pill">Realizado</span>}</h3>
          <p>{[s.evento, s.local, s.hora].filter(Boolean).join(' · ')}{s.link ? ' · com link de ingressos' : ''}</p>
        </div>
        <div className="adm-row-actions">
          <button className="adm-btn adm-btn--sm" onClick={() => setEditing(s)}>Editar</button>
          <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => remove(s)}>Excluir</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader title="Agenda" eyebrow="Próximos bailes"
        description="Datas que já passaram somem sozinhas da lista de próximos shows e aparecem em “Por onde o baile passou” por 60 dias."
        actions={<button className="adm-btn adm-btn--gold" onClick={() => setEditing(EMPTY)}>{Icon.plus} Novo show</button>} />
      {toast}
      {demo && <p className="adm-notice" style={{ marginBottom: 18 }}><b>Modo demonstração ligado:</b> no site, as datas passadas estão aparecendo como próximas, com o aviso “Datas ilustrativas”. Desligue em Perfil da empresa antes de divulgar.</p>}
      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Próximos shows</h2><p>{future.length} {future.length === 1 ? 'data' : 'datas'}</p></div></div>
        {future.length ? <div className="adm-list">{future.map(s => <Row key={s.id} s={s} />)}</div> : <p className="adm-notice">Nenhum show futuro. No site aparece o aviso “Novas datas em breve”.</p>}
      </section>
      {past.length > 0 && (
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Já realizados</h2><p>{past.length} {past.length === 1 ? 'data' : 'datas'}</p></div></div>
          <div className="adm-list">{past.map(s => <Row key={s.id} s={s} isPast />)}</div>
        </section>
      )}
      {editing && <ShowForm show={editing} onClose={() => setEditing(null)} onSaved={a => { setAgenda(a); setEditing(null); }} notify={notify} />}
    </>
  );
}
