'use client';

import { LogOut, ChevronsUpDown } from 'lucide-react';
import { NavItem, NavItemConfig } from './NavItem';
import { cn, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
    navItems: NavItemConfig[];
}

export function Sidebar({ navItems }: SidebarProps) {
    const { user, activeWorkspace, activeWorkspaceId, switchWorkspace, logout } = useAuth();

    const groupedItems = navItems.reduce((acc, item) => {
        const section = item.section || 'MAIN NAVIGATION';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {} as Record<string, NavItemConfig[]>);

    const isProOrPremium = activeWorkspace?.plan === 'pro' || activeWorkspace?.plan === 'premium';
    const businessName = isProOrPremium ? (activeWorkspace?.businessName || 'Mi Espacio') : 'Hi Krew';
    const displayLogo = isProOrPremium ? (activeWorkspace?.logo || undefined) : '/HiKrewLogo.png';
    const initials = isProOrPremium ? businessName.substring(0, 2).toUpperCase() : 'HK';
    const brandColorStyle = (isProOrPremium && activeWorkspace?.brandColor) ? { color: activeWorkspace.brandColor } : {};

    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Usuario';
    const userInitial = (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase();

    return (
        <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800/50 shrink-0">

            {/* ── Brand header ── */}
            <div className="h-14 flex items-center px-4 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Avatar className="w-7 h-7 rounded-lg shrink-0 ring-1 ring-zinc-200/80 dark:ring-zinc-700/80">
                        <AvatarImage src={getImageUrl(displayLogo)} alt={businessName} className="object-cover" />
                        <AvatarFallback
                            className="rounded-lg text-[11px] font-bold bg-gradient-to-br from-violet-500 to-violet-700 text-white"
                            style={brandColorStyle}
                        >
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-[13px] text-zinc-900 dark:text-white tracking-tight truncate" title={businessName}>
                        {businessName}
                    </span>
                </div>

                {user?.workspaceMembers && user.workspaceMembers.length > 1 && (
                    <div className="relative shrink-0">
                        <select
                            className="appearance-none bg-transparent text-zinc-400 text-xs pl-1 pr-5 py-1 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md outline-none"
                            value={activeWorkspaceId || ''}
                            onChange={(e) => switchWorkspace(e.target.value)}
                        >
                            {user.workspaceMembers.map(wm => (
                                <option key={wm.workspaceId} value={wm.workspaceId}>
                                    {wm.workspace.businessName}
                                </option>
                            ))}
                        </select>
                        <ChevronsUpDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto py-5 px-3 scrollbar-hide">
                <div className="space-y-5">
                    {Object.entries(groupedItems).map(([section, items]) => (
                        <div key={section}>
                            <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.13em] text-zinc-400/70 dark:text-zinc-500/80 uppercase select-none">
                                {section}
                            </p>
                            <div className="space-y-0.5">
                                {items.map((item) => (
                                    <NavItem key={item.href} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            {/* ── User footer ── */}
            <div className="shrink-0 p-3 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group">
                    <Avatar className="h-7 w-7 ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
                        <AvatarImage src={getImageUrl(user?.profileImage)} alt={userFullName} className="object-cover" />
                        <AvatarFallback className="bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-bold text-[11px] uppercase">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                            {userFullName}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                            {user?.email}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                        title="Cerrar sesión"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

        </aside>
    );
}
