'use client';

import { DashboardShell, Surface } from "@/components/layout/DashboardShell";
import { Sidebar } from "@/components/layout/Sidebar";
import { LayoutDashboard, Users } from "lucide-react";

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuarios', icon: Users },
];

export default function AdminDashboardPage() {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                navItems={navItems}
            />
            <DashboardShell>
                <Surface>
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Admin Dashboard</h1>
                    <p className="text-zinc-500">Bienvenido al panel de administración.</p>
                </Surface>
            </DashboardShell>
        </div>
    );
}
