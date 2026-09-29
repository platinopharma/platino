import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Platino Pharmacy | Digital Platform',
    short_name: 'Platino',
    description: 'Platino Pharmacy helps local pharmacies digitize their business.',
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
