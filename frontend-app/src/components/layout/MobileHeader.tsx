'use client';

import { ChevronsUpDown } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function MobileHeader() {
    const { user, activeWorkspace, activeWorkspaceId, switchWorkspace } = useAuth();

    const isProOrPremium = activeWorkspace?.plan === 'pro' || activeWorkspace?.plan === 'premium';
    const businessName = isProOrPremium ? (activeWorkspace?.businessName || 'Mi Espacio') : 'Hi Krew';
    const displayLogo = isProOrPremium ? (activeWorkspace?.logo || undefined) : '/HiKrewLogo.png';
    const initials = isProOrPremium ? businessName.substring(0, 2).toUpperCase() : 'HK';
    const brandColorStyle = (isProOrPremium && activeWorkspace?.brandColor) ? { backgroundColor: activeWorkspace.brandColor } : {};

    const userInitial = (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase();

    return (
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between px-4 bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-zinc-900 dark:to-zinc-950 border-b border-gray-200/60 dark:border-zinc-800/50 shrink-0">

            {/* Left: workspace branding */}
            <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="w-7 h-7 rounded-lg shrink-0 ring-1 ring-gray-200 dark:ring-zinc-700 shadow-sm">
                    <AvatarImage src={getImageUrl(displayLogo)} alt={businessName} className="object-cover" />
                    <AvatarFallback
                        className="rounded-lg text-[11px] font-bold bg-gray-800 dark:bg-zinc-700 text-white"
                        style={brandColorStyle}
                    >
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-semibold text-[14px] text-gray-900 dark:text-white tracking-tight truncate leading-tight">
                        {businessName}
                    </p>
                    {isProOrPremium && activeWorkspace?.businessName && (
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-tight truncate">
                            Hi Krew
                        </p>
                    )}
                </div>

                {/* Workspace switcher */}
                {user?.workspaceMembers && user.workspaceMembers.length > 1 && (
                    <div className="relative shrink-0 ml-0.5">
                        <select
                            className="appearance-none bg-transparent text-gray-400 text-xs pl-1 pr-4 py-1 cursor-pointer outline-none"
                            value={activeWorkspaceId || ''}
                            onChange={(e) => switchWorkspace(e.target.value)}
                        >
                            {user.workspaceMembers.map(wm => (
                                <option key={wm.workspaceId} value={wm.workspaceId}>
                                    {wm.workspace.businessName}
                                </option>
                            ))}
                        </select>
                        <ChevronsUpDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Right: user avatar */}
            <Avatar className="h-8 w-8 ring-1 ring-gray-200 dark:ring-zinc-700 shrink-0">
                <AvatarImage src={getImageUrl(user?.profileImage)} alt="Perfil" className="object-cover" />
                <AvatarFallback className="bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 font-bold text-[11px] uppercase">
                    {userInitial}
                </AvatarFallback>
            </Avatar>

        </header>
    );
}
