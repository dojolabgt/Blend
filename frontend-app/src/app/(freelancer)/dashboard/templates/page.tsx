'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TemplatesRootRoute() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/templates/briefs');
    }, [router]);

    return null;
}
