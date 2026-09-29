import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'platinopharma · Pharmacy Operations Console',
    short_name: 'Platino Admin',
    description: 'manage your nationwide pharmacy network, orders, and verifications in one console.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0F5132',
    icons: [
      {
        src: '/turtle-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/turtle-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
