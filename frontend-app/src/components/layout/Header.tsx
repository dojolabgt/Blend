'use client';

import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopHeader() {
    const { user, logout, activeWorkspace } = useAuth();
    const router = useRouter();

    if (!user) return null;

    const isProOrPremium = activeWorkspace?.plan === 'pro' || activeWorkspace?.plan === 'premium';
    const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario';
    const businessName = isProOrPremium
        ? (activeWorkspace?.businessName || userFullName || 'Mi Espacio')
        : (userFullName || 'Usuario');
    const initials = (user.firstName?.[0] || user.email[0]).toUpperCase();

    return (
        <header className="sticky top-0 z-30 hidden md:flex h-14 w-full items-center justify-end px-5 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors outline-none group">
                        <Avatar className="h-7 w-7 ring-1 ring-zinc-200 dark:ring-zinc-700">
                            <AvatarImage src={getImageUrl(user.profileImage)} alt={businessName} className="object-cover" />
                            <AvatarFallback className="bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-bold uppercase text-[11px]">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">
                            {userFullName}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
                                <AvatarImage src={getImageUrl(user.profileImage)} alt={businessName} className="object-cover" />
                                <AvatarFallback className="bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-bold text-xs uppercase">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">{businessName}</p>
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">{user.email}</p>
                            </div>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                            <UserIcon className="mr-2 h-4 w-4 text-zinc-400" />
                            <span>Mi Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            <Settings className="mr-2 h-4 w-4 text-zinc-400" />
                            <span>Integraciones</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={logout}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
