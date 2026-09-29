import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Qpro Concursos — Plataforma Inteligente de Questões',
    short_name: 'Qpro Concursos',
    description: 'Resolva milhares de questões comentadas, filtre em cascata e gere simulados inéditos com IA.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}