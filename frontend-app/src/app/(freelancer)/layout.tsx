'use client';

import { useRequireRole } from '@/features/auth/hooks/useRequireRole';
import { UserRole } from '@/types';

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
    const { isAuthorized, isLoading } = useRequireRole(UserRole.FREELANCER);

    if (isLoading) return null; // Or a full-screen spinner
    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
            {/* Future Sidebar component will go here */}
            <main className="flex-1 w-full relative">
                {children}
            </main>
        </div>
    );
}
