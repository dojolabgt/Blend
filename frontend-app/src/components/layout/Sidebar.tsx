'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, Settings } from 'lucide-react';
import { User } from '@/types';
import { NavItem, NavItemConfig } from './NavItem';
import { cn } from '@/lib/utils';

interface SidebarProps {
    navItems: NavItemConfig[];
    user: User;
    onLogout: () => void;
    settingsHref: string;
}

export function Sidebar({ navItems, user, onLogout, settingsHref }: SidebarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Group items by section
    const groupedItems = navItems.reduce((acc, item) => {
        const section = item.section || 'MAIN NAVIGATION';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {} as Record<string, NavItemConfig[]>);

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 fixed top-0 w-full z-40 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-white tracking-tight">Blend Studio</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Main Sidebar Desktop + Mobile Menu */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800/60 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col",
                mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>

                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800/60 gap-3 shrink-0">
                    <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Blend Studio</span>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto pt-6 pb-4 px-3 space-y-8 scrollbar-hide">
                    {Object.entries(groupedItems).map(([section, items]) => (
                        <div key={section} className="space-y-2">
                            <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                                {section}
                            </p>
                            <nav className="space-y-1">
                                {items.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        onClick={() => setMobileMenuOpen(false)}
                                    />
                                ))}
                            </nav>
                        </div>
                    ))}

                    {/* Support Section Hardcoded at bottom of nav */}
                    <div className="space-y-2 pt-4">
                        <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                            SUPPORT
                        </p>
                        <nav className="space-y-1">
                            <Link
                                href={settingsHref}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    pathname.startsWith(settingsHref)
                                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-semibold"
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50"
                                )}
                            >
                                <Settings className={cn("mr-3 h-4 w-4 shrink-0 transition-colors", pathname.startsWith(settingsHref) ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-600")} />
                                Settings
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 shrink-0">
                    <div className="flex items-center w-full group">
                        <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold uppercase shrink-0 border border-zinc-300 dark:border-zinc-700">
                                {user.firstName?.[0] || user.email[0]}
                            </div>
                            {/* Online Status Dot */}
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950"></span>
                        </div>
                        <div className="ml-3 flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.firstName || 'User')}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate capitalize tracking-wide">
                                {user.role}
                            </p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors ml-1"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
