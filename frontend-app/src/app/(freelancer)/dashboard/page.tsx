'use client';

import { DashboardShell, Surface } from "@/components/layout/DashboardShell";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserRole } from "@/lib/types/enums";
import { LayoutDashboard, User } from "lucide-react";

const mockUser = {
    id: "2",
    email: "freelancer@blend.com",
    role: UserRole.FREELANCER,
    firstName: "Pablo",
    lastName: "L.",
    status: "active" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Mi Perfil', icon: User },
];

export default function FreelancerDashboardPage() {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                navItems={navItems}
                user={mockUser}
                settingsHref="/dashboard/profile"
                onLogout={() => console.log('logout')}
            />
            <DashboardShell>
                <Surface>
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Freelancer Dashboard</h1>
                    <p className="text-zinc-500">Bienvenido a tu panel de control.</p>
                </Surface>
            </DashboardShell>
        </div>
    );
}
