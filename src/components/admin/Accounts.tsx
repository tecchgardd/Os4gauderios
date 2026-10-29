'use client';
import { useState } from 'react';
import { createUserAction, deleteUserAction, updateUserAction } from '@/app/(admin)/admin/actions';
import type { AdminUser } from '@/lib/auth';
import type { UserRow } from '@/lib/users';
import { brDate } from '@/lib/format';
import { Field, Input, Modal, useToast, type Notify } from './Fields';
import { Icon } from './Icon';
import PageHeader from './PageHeader';

const ROLES = [
  { id: 'editor', label: 'Editor', text: 'Edita perfil, fotos, vídeos, textos e agenda.' },
  { id: 'admin', label: 'Administrador', text: 'Tudo do editor e também cria e remove usuários.' }
];

function UserForm({ edit, me, onClose, onSaved, notify }: { edit: Partial<UserRow>; me: AdminUser; onClose: () => void; onSaved: (u: UserRow[]) => void; notify: Notify }) {
  const creating = !edit.id;
  const self = me.id === edit.id;
  const [form, setForm] = useState({ username: edit.username ?? '', name: edit.name ?? '', password: '', role: edit.role ?? 'editor' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const r = creating
      ? await createUserAction(form)
      : await updateUserAction(edit.id!, { name: form.name, role: form.role, ...(form.password ? { password: form.password } : {}) });
    setSaving(false);
    if (!r.ok) { setErrors(r.fields ?? {}); return notify(r.error, 'error'); }
    onSaved(r.data);
    notify(creating ? `Usuário @${form.username} criado.` : 'Usuário atualizado.');
  }

  return (
    <Modal title={creating ? 'Novo usuário' : `Editar @${edit.username}`} onClose={onClose}
      footer={<><button className="adm-btn adm-btn--ghost" onClick={onClose}>Cancelar</button><button className="adm-btn adm-btn--gold" onClick={save} disabled={saving}>{saving ? 'Salvando…' : creating ? 'Criar usuário' : 'Salvar'}</button></>}>
      <div className="adm-grid adm-grid--2">
        <Field label="Nome" error={errors.name}><Input value={form.name} error={errors.name} onChange={e => set('name', e.target.value)} autoFocus /></Field>
        <Field label="Usuário (para entrar)" error={errors.username} hint={creating ? 'Letras minúsculas, números, ponto ou hífen' : 'O usuário não pode ser alterado'}>
          <Input value={form.username} disabled={!creating} error={errors.username} autoCapitalize="none" spellCheck={false}
            onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))} />
        </Field>
        <Field label={creating ? 'Senha' : 'Nova senha (opcional)'} error={errors.password} hint="Pelo menos 8 caracteres" className="adm-span-2">
          <div className="adm-pass">
            <Input type={show ? 'text' : 'password'} value={form.password} autoComplete="new-password" error={errors.password} onChange={e => set('password', e.target.value)} />
            <button type="button" onClick={() => setShow(!show)}>{show ? 'Esconder' : 'Mostrar'}</button>
          </div>
        </Field>
        <Field label="Perfil de acesso" error={errors.role} className="adm-span-2">
          <div className="adm-grid adm-grid--2">
            {ROLES.map(r => (
              <label key={r.id} className="adm-card" style={{ padding: 14, cursor: self ? 'not-allowed' : 'pointer', borderColor: form.role === r.id ? 'var(--gold)' : undefined }}>
                <input type="radio" name="role" value={r.id} checked={form.role === r.id} disabled={self} onChange={() => set('role', r.id)} style={{ marginRight: 8 }} />
                <b>{r.label}</b>
                <small style={{ display: 'block', color: 'var(--dim)', marginTop: 4 }}>{r.text}</small>
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

export default function Accounts({ user, initial }: { user: AdminUser; initial: UserRow[] }) {
  const [users, setUsers] = useState(initial);
  const [editing, setEditing] = useState<Partial<UserRow> | null>(null);
  const [toast, notify] = useToast();

  async function remove(u: UserRow) {
    if (!confirm(`Excluir o usuário @${u.username}? Essa pessoa perde o acesso ao painel na hora.`)) return;
    const r = await deleteUserAction(u.id);
    if (!r.ok) return notify(r.error, 'error');
    setUsers(r.data);
    notify('Usuário excluído.');
  }

  return (
    <>
      <PageHeader title="Usuários" eyebrow="Acesso ao painel"
        description="Cada pessoa entra com um usuário e uma senha próprios. Não é preciso e-mail."
        actions={<button className="adm-btn adm-btn--gold" onClick={() => setEditing({})}>{Icon.plus} Novo usuário</button>} />
      {toast}
      <section className="adm-card">
        <div className="adm-list">
          {users.map(u => (
            <div key={u.id} className="adm-row" style={{ gridTemplateColumns: '48px 1fr auto' }}>
              <span className="adm-avatar" style={{ width: 44, height: 44 }}>{u.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <h3>{u.name}{u.id === user.id && <span className="adm-pill adm-pill--gold">Você</span>}<span className={`adm-pill${u.role === 'admin' ? ' adm-pill--gold' : ''}`}>{u.role === 'admin' ? 'Administrador' : 'Editor'}</span></h3>
                <p>@{u.username} · desde {brDate(u.createdAt)}</p>
              </div>
              <div className="adm-row-actions">
                <button className="adm-btn adm-btn--sm" onClick={() => setEditing(u)}>Editar</button>
                {u.id !== user.id && <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => remove(u)}>Excluir</button>}
              </div>
            </div>
          ))}
        </div>
      </section>
      {editing && <UserForm edit={editing} me={user} onClose={() => setEditing(null)} onSaved={list => { setUsers(list); setEditing(null); }} notify={notify} />}
    </>
  );
}
