import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Hi Krew',
        short_name: 'Hi Krew',
        description: 'Plataforma de gestión para freelancers',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#f9fafb',
        theme_color: '#111827',
        orientation: 'portrait',
        categories: ['business', 'productivity'],
        icons: [
            {
                src: '/HiKrewLogo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/HiKrewLogo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/HiKrewLogo.png',
                sizes: 'any',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        shortcuts: [
            {
                name: 'Dashboard',
                url: '/dashboard',
                icons: [{ src: '/HiKrewLogo.png', sizes: '96x96' }],
            },
        ],
    };
}
