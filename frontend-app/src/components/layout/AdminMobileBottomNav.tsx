'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/admin/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuarios', icon: Users },
];

export function AdminMobileBottomNav() {
    const pathname = usePathname();

    function isActive(href: string) {
        return pathname === href || pathname.startsWith(href + '/');
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-white/[0.06]">
                <div className="flex items-end justify-around h-16 max-w-md mx-auto px-8">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center gap-1 py-2 flex-1 transition-all duration-200"
                            >
                                <span className={cn(
                                    'absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200',
                                    active ? 'w-5 bg-gray-800 dark:bg-white' : 'w-0 bg-transparent'
                                )} />
                                <item.icon className={cn(
                                    'h-[22px] w-[22px] transition-all duration-200',
                                    active
                                        ? 'text-gray-900 dark:text-white stroke-[2.5px]'
                                        : 'text-gray-500 dark:text-white/50 stroke-[1.5px]'
                                )} />
                                <span className={cn(
                                    'text-[10px] leading-none transition-colors',
                                    active
                                        ? 'font-bold text-gray-900 dark:text-white'
                                        : 'font-medium text-gray-500 dark:text-white/50'
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
