'use client';

import { NavItem } from '@/components/layout/NavItem';
import {
    User,
    Palette,
    Link2,
    CreditCard,
    FileDigit,
    MapPin,
    Shield,
    Puzzle,
    Users,
} from 'lucide-react';

import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const { t } = useWorkspaceSettings();

    const settingsNavItems = [
        {
            title: t('settingsLayout.general'),
            items: [
                { href: '/dashboard/settings/personal-info', label: t('settingsLayout.personalInfo'), icon: User },
                { href: '/dashboard/settings/security', label: t('settingsLayout.security'), icon: Shield },
                { href: '/dashboard/settings/branding', label: t('settingsLayout.branding'), icon: Palette },
                { href: '/dashboard/settings/localization', label: t('settingsLayout.localization'), icon: MapPin },
                { href: '/dashboard/settings/team', label: 'Equipo', icon: Users },
            ]
        },
        {
            title: t('settingsLayout.billing'),
            items: [
                { href: '/dashboard/settings/billing', label: t('settingsLayout.plan'), icon: CreditCard },
                { href: '/dashboard/settings/taxes', label: t('settingsLayout.taxes'), icon: FileDigit },
            ]
        },
        {
            title: t('settingsLayout.advanced'),
            items: [
                { href: '/dashboard/settings/integrations', label: t('settingsLayout.integrations'), icon: Link2 },
                { href: '/dashboard/settings/modules', label: t('settingsLayout.modules'), icon: Puzzle },
            ]
        }
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-full w-full">

            {/* ── Settings Sidebar ── */}
            <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/[0.05] bg-white dark:bg-[#111111]">
                <div className="md:sticky md:top-0 px-3 py-6 overflow-y-auto">

                    {/* Header */}
                    <div className="px-3 mb-6">
                        <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
                            {t('settingsLayout.title')}
                        </h2>
                        <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5 leading-snug">
                            {t('settingsLayout.desc')}
                        </p>
                    </div>

                    {/* Nav groups */}
                    <nav className="space-y-5">
                        {settingsNavItems.map((group) => (
                            <div key={group.title}>
                                <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-gray-500 dark:text-white/40 uppercase select-none">
                                    {group.title}
                                </p>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => (
                                        <NavItem key={item.href} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* ── Content Area ── */}
            <div className="flex-1 w-full min-w-0 bg-gray-50/50 dark:bg-[#0d0d0d]">
                {children}
            </div>

        </div>
    );
}
