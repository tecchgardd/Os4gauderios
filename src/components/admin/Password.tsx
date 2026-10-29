'use client';
import { useState, type FormEvent } from 'react';
import { changeOwnPassword } from '@/app/(admin)/admin/actions';
import { Field, Input, useToast } from './Fields';
import PageHeader from './PageHeader';

export default function Password({ username }: { username: string }) {
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, notify] = useToast();
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function save(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return setErrors({ confirm: 'As senhas não são iguais' });
    setSaving(true);
    const r = await changeOwnPassword(form.current, form.password);
    setSaving(false);
    if (!r.ok) { setErrors(r.fields ?? {}); return notify(r.error, 'error'); }
    setErrors({});
    setForm({ current: '', password: '', confirm: '' });
    notify('Senha alterada.');
  }

  return (
    <>
      <PageHeader title="Minha senha" eyebrow={`@${username}`} description="Troque a senha que você usa para entrar no painel." />
      {toast}
      <form className="adm-card" style={{ maxWidth: 520 }} onSubmit={save}>
        <div className="adm-grid">
          <Field label="Senha atual" error={errors.current}><Input type="password" autoComplete="current-password" value={form.current} error={errors.current} onChange={e => set('current', e.target.value)} /></Field>
          <Field label="Nova senha" error={errors.password} hint="Pelo menos 8 caracteres"><Input type="password" autoComplete="new-password" value={form.password} error={errors.password} onChange={e => set('password', e.target.value)} /></Field>
          <Field label="Repita a nova senha" error={errors.confirm}><Input type="password" autoComplete="new-password" value={form.confirm} error={errors.confirm} onChange={e => set('confirm', e.target.value)} /></Field>
          <button className="adm-btn adm-btn--gold" disabled={saving || !form.current || !form.password}>{saving ? 'Salvando…' : 'Trocar senha'}</button>
        </div>
      </form>
    </>
  );
}
