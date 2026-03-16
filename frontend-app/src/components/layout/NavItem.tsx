'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface NavItemConfig {
    href: string;
    label: string;
    icon: LucideIcon;
    section?: string;
}

interface NavItemProps {
    item: NavItemConfig;
    isMobile?: boolean;
    onClick?: () => void;
}

export function NavItem({ item, onClick }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                "group relative flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-150",
                isActive
                    ? "bg-violet-50 text-violet-700 font-semibold dark:bg-violet-950/40 dark:text-violet-300"
                    : "text-zinc-500 font-medium hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50"
            )}
        >
            {/* Left accent bar */}
            <span className={cn(
                "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full transition-all duration-150",
                isActive ? "bg-violet-500 dark:bg-violet-400" : "bg-transparent"
            )} />

            <item.icon
                className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )}
                aria-hidden="true"
            />
            {item.label}
        </Link>
    );
}
