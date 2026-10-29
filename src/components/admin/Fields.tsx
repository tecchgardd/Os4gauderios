'use client';
// Campos, avisos e janelas usados em todos os módulos do painel.
import { useCallback, useEffect, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

export function Field({ label, error, hint, children, className = '' }: { label?: string; error?: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`adm-field ${className}`}>
      {label && <label>{label}</label>}
      {children}
      {error ? <span className="adm-err">{error}</span> : hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function Input({ error, ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input className={`adm-input${error ? ' is-error' : ''}`} {...props} />;
}

export function Textarea({ error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea className={`adm-textarea${error ? ' is-error' : ''}`} {...props} />;
}

export function Switch({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="adm-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <i aria-hidden="true" />
      <span>{children}</span>
    </label>
  );
}

export function SaveBar({ dirty, saving, onSave, onDiscard, label = 'Alterações não salvas' }: { dirty: boolean; saving: boolean; onSave: () => void; onDiscard?: () => void; label?: string }) {
  return (
    <div className={`adm-savebar${dirty ? ' is-visible' : ''}`} aria-hidden={!dirty}>
      <span>{label}</span>
      {onDiscard && <button className="adm-btn adm-btn--ghost" onClick={onDiscard} disabled={saving}>Descartar</button>}
      <button className="adm-btn adm-btn--gold" onClick={onSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
    </div>
  );
}

export function Modal({ title, children, onClose, footer }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="adm-modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

type Toast = { text: string; kind: 'ok' | 'error'; id: number };

// aviso flutuante que some sozinho
export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((text: string, kind: Toast['kind'] = 'ok') => setToast({ text, kind, id: Date.now() }), []);
  const node = toast ? <div key={toast.id} className={`adm-toast adm-toast--${toast.kind}`} role="status">{toast.text}</div> : null;
  return [node, show] as const;
}

export type Notify = ReturnType<typeof useToast>[1];

// avisa antes de sair da página com alterações não salvas
export function useLeaveGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    addEventListener('beforeunload', h);
    return () => removeEventListener('beforeunload', h);
  }, [dirty]);
}
