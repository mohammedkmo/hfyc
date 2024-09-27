import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PCH Badging System',
    short_name: 'pch-badge',
    description: 'A badging system for PCH that enables the contractors to fill and upload the documents required for the badge issuance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/public/pch-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/public/pch-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}