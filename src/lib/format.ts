// Formatação usada no site e no painel.

export const esc = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const mb = (bytes: number) => `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB`;

export const brDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

export const today = () => new Date().toISOString().slice(0, 10);
