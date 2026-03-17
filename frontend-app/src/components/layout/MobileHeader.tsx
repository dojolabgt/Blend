'use client';

import { ChevronsUpDown } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function MobileHeader() {
    const { user, activeWorkspace, activeWorkspaceId, switchWorkspace } = useAuth();

    const isProOrPremium = activeWorkspace?.plan === 'pro' || activeWorkspace?.plan === 'premium';
    const businessName = isProOrPremium ? (activeWorkspace?.businessName || 'Mi Espacio') : 'Hi Krew';
    const displayLogo = isProOrPremium ? (activeWorkspace?.logo || undefined) : '/HiKrewLogo.png';
    const initials = isProOrPremium ? businessName.substring(0, 2).toUpperCase() : 'HK';
    const brandColorStyle = (isProOrPremium && activeWorkspace?.brandColor) ? { backgroundColor: activeWorkspace.brandColor } : {};

    const userInitial = (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase();

    return (
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between px-4 bg-white dark:bg-[#111111] border-b border-gray-200/80 dark:border-white/[0.06] shrink-0">

            {/* Left: workspace branding */}
            <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="w-9 h-9 rounded-xl shrink-0 ring-1 ring-gray-200 dark:ring-white/[0.12] shadow-sm">
                    <AvatarImage src={getImageUrl(displayLogo)} alt={businessName} className="object-cover" />
                    <AvatarFallback
                        className="rounded-xl text-[13px] font-bold bg-zinc-900 dark:bg-zinc-800 text-white"
                        style={brandColorStyle}
                    >
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-bold text-[15px] text-gray-900 dark:text-white tracking-tight truncate leading-tight">
                        {businessName}
                    </p>
                    {isProOrPremium && activeWorkspace?.businessName && (
                        <p className="text-[11px] text-gray-500 dark:text-white/50 leading-tight truncate">
                            Hi Krew
                        </p>
                    )}
                </div>

                {user?.workspaceMembers && user.workspaceMembers.length > 1 && (
                    <div className="relative shrink-0 ml-0.5">
                        <select
                            className="appearance-none bg-transparent text-gray-500 text-xs pl-1 pr-4 py-1 cursor-pointer outline-none"
                            value={activeWorkspaceId || ''}
                            onChange={(e) => switchWorkspace(e.target.value)}
                        >
                            {user.workspaceMembers.map(wm => (
                                <option key={wm.workspaceId} value={wm.workspaceId}>
                                    {wm.workspace.businessName}
                                </option>
                            ))}
                        </select>
                        <ChevronsUpDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Right: theme toggle + user avatar */}
            <div className="flex items-center gap-1.5 shrink-0">
                <ThemeToggle />
                <Avatar className="h-8 w-8 ring-1 ring-gray-200 dark:ring-white/[0.12] shrink-0">
                    <AvatarImage src={getImageUrl(user?.profileImage)} alt="Perfil" className="object-cover" />
                    <AvatarFallback className="bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold text-[11px] uppercase">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>
            </div>

        </header>
    );
}
