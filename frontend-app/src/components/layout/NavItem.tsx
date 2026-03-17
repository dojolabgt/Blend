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
    badge?: number;
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
                'flex items-center gap-2.5 py-2 px-3 text-[13px] rounded-xl transition-all duration-200',
                isActive
                    ? 'bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-white/60 font-medium hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white/85'
            )}
        >
            <item.icon
                className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive
                        ? 'text-gray-700 dark:text-white/85'
                        : 'text-gray-500 dark:text-white/50'
                )}
                aria-hidden="true"
            />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/65 rounded-full text-[10px] px-2 py-0.5 leading-none font-semibold">
                    {item.badge > 99 ? '99+' : item.badge}
                </span>
            )}
        </Link>
    );
}
