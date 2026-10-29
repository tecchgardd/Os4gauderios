import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // o HTML do site é lido de src/lib/content/template.html em tempo de execução
  outputFileTracingIncludes: { '/': ['./src/lib/content/template.html'] },
  experimental: {
    // vídeos não passam pelo servidor (vão direto para o Cloudinary), só a assinatura
    serverActions: { bodySizeLimit: '1mb' }
  }
};

export default nextConfig;
