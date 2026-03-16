'use client';

import { useEffect } from 'react';

export function ServiceWorkerProvider() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .catch(() => {
                    // SW registration failed silently
                });
        }
    }, []);

    return null;
}
