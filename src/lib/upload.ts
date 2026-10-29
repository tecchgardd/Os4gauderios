// Fotos, vídeos e arquivos do painel no Cloudinary.
// O navegador envia o arquivo direto para o Cloudinary (em partes, com barra de progresso);
// o servidor só assina o envio e depois confere o arquivo antes de colocá-lo no site.
import 'server-only';
import { v2 as cloudinary } from 'cloudinary';
import type { MediaDef, MediaType } from './content/registry';

export type CloudType = 'image' | 'video' | 'raw';

export const ALLOWED: Record<MediaType, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
  video: ['mp4', 'webm', 'mov'],
  file: ['zip', 'pdf']
};
export const MAX_MB: Record<MediaType, number> = { image: 40, video: 800, file: 1500 };

const env = () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? ''
});
const folder = () => (process.env.CLOUDINARY_FOLDER || 'os4gauderios').replace(/^\/+|\/+$/g, '');

export const uploadReady = () => Object.values(env()).every(Boolean);

function client() {
  cloudinary.config({ ...env(), secure: true });
  return cloudinary;
}

export const cloudType = (type: MediaType): CloudType => (type === 'file' ? 'raw' : type);

// prefixo de todo arquivo de um espaço do site: os4gauderios/divulgacao/kit_zip-...
export const slotPrefix = (def: MediaDef) => `${folder()}/${def.section}/${def.slot}-`;

export function signUpload(def: MediaDef, ext: string) {
  const { cloud_name, api_key, api_secret } = env();
  const resource = cloudType(def.type);
  const params: Record<string, string | number> = {
    timestamp: Math.round(Date.now() / 1000),
    // arquivos "raw" (ZIP/PDF) precisam da extensão no nome
    public_id: `${slotPrefix(def)}${Date.now()}${resource === 'raw' ? `.${ext}` : ''}`
  };
  if (resource !== 'raw') params.allowed_formats = ALLOWED[def.type].join(',');
  const signature = client().utils.api_sign_request(params, api_secret);
  return {
    url: `https://api.cloudinary.com/v1_1/${cloud_name}/${resource}/upload`,
    fields: { ...params, api_key, signature } as Record<string, string | number>
  };
}

// confere no Cloudinary o arquivo que o navegador diz ter enviado
export async function fetchUploaded(publicId: string, type: CloudType) {
  const r = await client().api.resource(publicId, { resource_type: type });
  return {
    url: r.secure_url as string,
    bytes: r.bytes as number,
    format: (r.format as string | undefined) ?? publicId.split('.').pop() ?? '',
    width: r.width as number | undefined,
    height: r.height as number | undefined
  };
}

export async function removeUploaded(publicId: string, type: string) {
  try {
    await client().uploader.destroy(publicId, { resource_type: type, invalidate: true });
  } catch (err) {
    console.error('Cloudinary: não foi possível apagar', publicId, err);
  }
}

// no kit de divulgação o link precisa baixar o arquivo, não abrir no navegador
export const asDownload = (url: string) => url.replace('/upload/', '/upload/fl_attachment/');
