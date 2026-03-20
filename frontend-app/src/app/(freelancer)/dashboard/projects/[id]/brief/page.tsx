'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/** The brief is now part of the Assets tab. Redirect automatically. */
export default function BriefRedirectPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        router.replace(`/dashboard/projects/${id}/assets`);
    }, [router, id]);

    return null;
}
