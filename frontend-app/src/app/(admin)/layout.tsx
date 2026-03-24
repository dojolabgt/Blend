'use client';

import { useRequireRoles } from '@/features/auth/hooks/useRequireRole';
import { ADMIN_ROLES } from '@/types';

import { Sidebar } from "@/components/layout/Sidebar";
import { LayoutDashboard, Users } from "lucide-react";
import { AdminMobileHeader } from "@/components/layout/AdminMobileHeader";
import { AdminMobileBottomNav } from "@/components/layout/AdminMobileBottomNav";

const navItems = [
    { href: '/admin/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuarios', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthorized, isLoading } = useRequireRoles(ADMIN_ROLES);

    if (isLoading) return null;
    if (!isAuthorized) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-[#0A0A0A]">
            <Sidebar navItems={navItems} />
            <main className="flex-1 flex flex-col min-w-0">
                <AdminMobileHeader />
                <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
                    {children}
                </div>
            </main>
            <AdminMobileBottomNav />
        </div>
    );
}
