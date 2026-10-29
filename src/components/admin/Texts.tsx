'use client';
import { useEffect, useMemo, useState } from 'react';
import { saveTextsAction } from '@/app/(admin)/admin/actions';
import { SECTIONS, TEXTS } from '@/lib/content/registry';
import { Field, Input, SaveBar, Textarea, useLeaveGuard, useToast } from './Fields';
import PageHeader from './PageHeader';

// mesma regra do site: *texto* = itálico dourado, Enter = quebra de linha
const preview = (v: string) => v.split('\n').map((line, i) => (
  <span key={i}>{i > 0 && <br />}{line.split(/(\*[^*]+\*)/g).map((p, j) => p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={j}>{p.slice(1, -1)}</em> : p)}</span>
));

const sections = SECTIONS.filter(s => TEXTS.some(t => t.section === s.id));

export default function Texts({ initial }: { initial: Record<string, string> }) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<string>(sections[0].id);
  const [toast, notify] = useToast();

  const changed = useMemo(() => TEXTS.filter(t => form[t.key] !== saved[t.key]).map(t => t.key), [form, saved]);
  const dirty = changed.length > 0;
  useLeaveGuard(dirty);

  // destaca na lateral a seção que está na tela
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id.replace('sec-', ''))), { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.adm-section').forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);

  async function save() {
    setSaving(true);
    const r = await saveTextsAction(Object.fromEntries(changed.map(k => [k, form[k]])));
    setSaving(false);
    if (!r.ok) return notify(r.error, 'error');
    setSaved(r.data);
    setForm(r.data);
    notify(`${changed.length} ${changed.length === 1 ? 'texto salvo' : 'textos salvos'}. O site já foi atualizado.`);
  }

  return (
    <>
      <PageHeader title="Textos do site" eyebrow="Conteúdo"
        description="Escolha a seção ao lado e edite os textos. Use *asteriscos* para o destaque em itálico dourado e Enter para quebrar a linha." />
      {toast}
      <div className="adm-split">
        <nav className="adm-sections" aria-label="Seções do site">
          {sections.map(s => {
            const sDirty = TEXTS.some(t => t.section === s.id && changed.includes(t.key));
            return (
              <a key={s.id} href={`#sec-${s.id}`} className={active === s.id ? 'is-active' : ''}>
                {s.label}<i className={sDirty ? 'is-dirty' : ''} />
              </a>
            );
          })}
        </nav>
        <div>
          {sections.map(s => (
            <section key={s.id} id={`sec-${s.id}`} className="adm-card adm-section">
              <div className="adm-card-head"><div><h2>{s.label}</h2><p>{s.hint}</p></div></div>
              <div className="adm-grid adm-grid--2">
                {TEXTS.filter(t => t.section === s.id).map(t => {
                  const value = form[t.key];
                  const isDefault = value === t.default;
                  const onChange = (e: { target: { value: string } }) => setForm(f => ({ ...f, [t.key]: e.target.value }));
                  return (
                    <div key={t.key} className={`adm-text-field${t.multiline ? ' adm-span-2' : ''}`}>
                      <Field label={t.label} hint={t.list ? 'Uma música por linha' : isDefault ? 'Texto original' : 'Texto alterado'}>
                        {t.multiline
                          ? <Textarea value={value} rows={Math.min(8, Math.max(3, value.split('\n').length + 1))} onChange={onChange} />
                          : <Input value={value} onChange={onChange} />}
                      </Field>
                      {!t.plain && /[*\n]/.test(value) && <div className="adm-preview" style={{ marginTop: 8 }}>{preview(value)}</div>}
                      {!isDefault && (
                        <button className="adm-btn adm-btn--sm adm-btn--ghost adm-reset" onClick={() => setForm(f => ({ ...f, [t.key]: t.default }))} title={t.default}>
                          Voltar ao original
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setForm(saved)}
        label={`${changed.length} ${changed.length === 1 ? 'texto alterado' : 'textos alterados'}`} />
    </>
  );
}
