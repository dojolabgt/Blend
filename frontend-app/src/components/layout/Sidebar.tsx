'use client';

import { LogOut, ChevronsUpDown, Check, ExternalLink, Building2, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { NavItem, NavItemConfig } from './NavItem';
import { cn, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
    navItems: NavItemConfig[];
}

const PLAN_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pro: {
        label: 'Pro',
        className: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/30',
        icon: <Zap className="w-2.5 h-2.5" />,
    },
    premium: {
        label: 'Premium',
        className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
        icon: <Sparkles className="w-2.5 h-2.5" />,
    },
};

export function Sidebar({ navItems }: SidebarProps) {
    const { user, activeWorkspace, activeWorkspaceId, switchWorkspace, logout } = useAuth();

    const ownerWorkspaces = user?.workspaceMembers?.filter(
        (wm) => wm.role === 'owner' || wm.role === 'collaborator',
    ) ?? [];

    const clientWorkspaces = user?.workspaceMembers?.filter(
        (wm) => wm.role === 'client',
    ) ?? [];

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

    const planBadge = activeWorkspace?.plan ? PLAN_BADGE[activeWorkspace.plan] : null;

    return (
        <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-[#111111] border-r border-gray-200/80 dark:border-white/[0.06] shrink-0">

            {/* ── Workspace switcher ── */}
            <div className="h-16 flex items-center px-3 shrink-0 border-b border-gray-100 dark:border-white/[0.06]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            'flex items-center gap-2.5 w-full px-2 py-2 rounded-xl',
                            'hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors outline-none',
                            'text-left group',
                        )}>
                            <Avatar className="w-8 h-8 rounded-lg shrink-0 ring-1 ring-gray-200 dark:ring-white/[0.12] shadow-sm">
                                <AvatarImage src={getImageUrl(displayLogo)} alt={businessName} className="object-cover" />
                                <AvatarFallback
                                    className="rounded-lg text-[12px] font-bold bg-zinc-900 dark:bg-zinc-800 text-white"
                                    style={brandColorStyle}
                                >
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="block font-semibold text-[13px] text-gray-900 dark:text-white truncate leading-tight">
                                        {businessName}
                                    </span>
                                    {planBadge && (
                                        <span className={cn(
                                            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
                                            planBadge.className,
                                        )}>
                                            {planBadge.icon}
                                            {planBadge.label}
                                        </span>
                                    )}
                                </div>
                                <span className="block text-[11px] text-gray-400 dark:text-white/40 leading-tight truncate">
                                    {user?.email}
                                </span>
                            </div>

                            <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 dark:text-white/30 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="start"
                        sideOffset={4}
                        className="w-64 p-1.5"
                    >
                        {ownerWorkspaces.length > 0 && (
                            <>
                                <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                                    Workspaces
                                </DropdownMenuLabel>
                                {ownerWorkspaces.map((wm) => {
                                    const isActive = wm.workspaceId === activeWorkspaceId;
                                    const wsPlan = wm.workspace.plan;
                                    const badge = wsPlan ? PLAN_BADGE[wsPlan] : null;
                                    const wsInitials = (wm.workspace.businessName ?? 'WS').substring(0, 2).toUpperCase();

                                    return (
                                        <DropdownMenuItem
                                            key={wm.workspaceId}
                                            onClick={() => !isActive && switchWorkspace(wm.workspaceId)}
                                            className={cn(
                                                'flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer',
                                                isActive && 'bg-zinc-100 dark:bg-zinc-800',
                                            )}
                                        >
                                            <Avatar className="h-7 w-7 rounded-lg shrink-0 ring-1 ring-gray-200 dark:ring-white/[0.1]">
                                                <AvatarImage src={getImageUrl(wm.workspace.logo)} className="object-cover" />
                                                <AvatarFallback className="text-[10px] font-bold bg-zinc-900 dark:bg-zinc-700 text-white rounded-lg">
                                                    {wsInitials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                                                    {wm.workspace.businessName ?? 'Mi Espacio'}
                                                </p>
                                                {badge && (
                                                    <span className={cn(
                                                        'inline-flex items-center gap-0.5 text-[10px] font-medium',
                                                        badge.className.split(' ').filter(c => c.startsWith('text-')).join(' '),
                                                    )}>
                                                        {badge.label}
                                                    </span>
                                                )}
                                            </div>
                                            {isActive && <Check className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />}
                                        </DropdownMenuItem>
                                    );
                                })}
                                <DropdownMenuSeparator className="my-1" />
                            </>
                        )}

                        <DropdownMenuItem
                            onClick={logout}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="text-[13px] font-medium">Cerrar sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">
                <div className="space-y-5">
                    {Object.entries(groupedItems).map(([section, items]) => (
                        <div key={section}>
                            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-gray-500 dark:text-white/40 uppercase select-none">
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

            {/* ── Client portal link ── */}
            {clientWorkspaces.length > 0 && (
                <div className="shrink-0 px-3 pb-1 border-t border-gray-100 dark:border-white/[0.06] pt-3">
                    <Link
                        href="/portal"
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all duration-200 group"
                    >
                        <div className="h-5 w-5 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                            <ExternalLink className="h-3 w-3" />
                        </div>
                        <span className="flex-1 text-[12px] font-medium truncate">
                            {clientWorkspaces.length === 1
                                ? `Portal · ${clientWorkspaces[0].workspace.businessName}`
                                : `Portal de cliente (${clientWorkspaces.length})`
                            }
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                </div>
            )}

            {/* ── User footer ── */}
            <div className={cn("shrink-0 p-3 border-t border-gray-100 dark:border-white/[0.06]", clientWorkspaces.length > 0 && "border-t-0")}>
                <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.03]">
                    <Avatar className="h-7 w-7 ring-1 ring-gray-200 dark:ring-white/[0.12] shrink-0">
                        <AvatarImage src={getImageUrl(user?.profileImage)} alt={userFullName} className="object-cover" />
                        <AvatarFallback className="bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold text-[11px] uppercase">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 dark:text-white/90 truncate leading-tight">
                            {userFullName}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-white/40 truncate leading-tight">
                            {activeWorkspace?.plan === 'premium' ? 'Premium' : activeWorkspace?.plan === 'pro' ? 'Pro' : 'Free'}
                        </p>
                    </div>
                </div>
            </div>

        </aside>
    );
}
