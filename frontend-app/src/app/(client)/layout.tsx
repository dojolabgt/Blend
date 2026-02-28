'use client';

import { useRequireRole } from '@/features/auth/hooks/useRequireRole';
import { UserRole } from '@/types';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isAuthorized, isLoading } = useRequireRole(UserRole.CLIENT);

    if (isLoading) return null; // Or a full-screen spinner
    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            {/* Minimal top nav for clients */}
            <main className="flex-1 w-full relative">
                {children}
            </main>
        </div>
    );
}
