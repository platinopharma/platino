import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Platino Pharma — Order medicines',
    short_name: 'Platino',
    description: 'Order medicines from trusted local pharmacies. Pay on delivery.',
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
