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

export function NavItem({ item, isMobile, onClick }: NavItemProps) {
    const pathname = usePathname();
    // Consider it active if paths match or we are deep inside the path (except exact home)
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50"
            )}
        >
            <item.icon
                className={cn(
                    "mr-3 h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )}
                aria-hidden="true"
            />
            {item.label}
        </Link>
    );
}
