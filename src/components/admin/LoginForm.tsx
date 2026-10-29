'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth-client';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await authClient.signIn.username({ username: username.trim().toLowerCase(), password });
    if (error) {
      setLoading(false);
      return setError(error.status === 429 ? 'Muitas tentativas. Aguarde 15 minutos.' : 'Usuário ou senha incorretos.');
    }
    const next = params.get('next') || '/admin';
    router.replace(next.startsWith('/admin') ? next : '/admin');
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <div className="adm-login-err" role="alert">{error}</div>}
      <div className="adm-field">
        <label htmlFor="u">Usuário</label>
        <input id="u" className="adm-input" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus
          value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="adm-field">
        <label htmlFor="p">Senha</label>
        <div className="adm-pass">
          <input id="p" className="adm-input" type={show ? 'text' : 'password'} autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>{show ? 'Esconder' : 'Mostrar'}</button>
        </div>
      </div>
      <button className="adm-btn adm-btn--gold" disabled={loading || !username || !password}>{loading ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}
