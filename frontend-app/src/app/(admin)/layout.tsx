'use client';

import { useRequireRoles } from '@/features/auth/hooks/useRequireRole';
import { ADMIN_ROLES } from '@/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthorized, isLoading } = useRequireRoles(ADMIN_ROLES);

    if (isLoading) return null; // Or a full-screen spinner
    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
            {/* Future Admin Sidebar component will go here */}
            <main className="flex-1 w-full relative">
                {children}
            </main>
        </div>
    );
}
