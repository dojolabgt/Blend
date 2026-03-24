'use client';

import { Shield } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { getImageUrl } from '@/lib/utils';

export function AdminMobileHeader() {
    const { user } = useAuth();
    const userInitial = (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase();

    return (
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between px-4 bg-white dark:bg-[#111111] border-b border-gray-200/80 dark:border-white/[0.06] shrink-0">
            {/* Left: Admin brand */}
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Shield className="h-4 w-4 text-white dark:text-zinc-900" strokeWidth={2.5} />
                </div>
                <div>
                    <p className="font-bold text-[15px] text-gray-900 dark:text-white tracking-tight leading-tight">
                        Admin
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-white/50 leading-tight">
                        Panel de control
                    </p>
                </div>
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
