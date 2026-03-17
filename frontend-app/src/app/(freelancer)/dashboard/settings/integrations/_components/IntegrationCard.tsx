'use client';

import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

interface IntegrationCardProps {
    logo: React.ReactNode;
    name: string;
    description: string;
    isConfigured: boolean;
    onConfigure: () => void;
    comingSoon?: boolean;
    proOnly?: boolean;
    userIsPro?: boolean;
    badges?: React.ReactNode[];
    disabledReason?: string;
}

export function IntegrationCard({
    logo,
    name,
    description,
    isConfigured,
    onConfigure,
    comingSoon = false,
    proOnly = false,
    userIsPro = true,
    badges,
    disabledReason,
}: IntegrationCardProps) {
    const { t } = useWorkspaceSettings();
    const isLocked = (proOnly && !userIsPro) || !!disabledReason;
    const isDisabled = comingSoon || isLocked;

    return (
        <div className={`flex flex-col rounded-2xl border transition-all duration-200 ${
            comingSoon
                ? 'opacity-55 grayscale border-gray-100 dark:border-white/[0.05] bg-white dark:bg-[#1a1a1a]'
                : isLocked
                    ? 'opacity-70 border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a]'
                    : 'border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-white/[0.1]'
        }`}>

            {/* Top row: logo + status */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center p-2.5 shrink-0">
                    {logo}
                </div>
                {comingSoon ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/40">
                        Próximamente
                    </span>
                ) : isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('integrations.connected')}
                    </span>
                ) : (
                    <span className="text-[9px] font-semibold uppercase tracking-widest px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/[0.04] text-gray-400 dark:text-white/35 border border-gray-100 dark:border-white/[0.06]">
                        {t('integrations.inactive')}
                    </span>
                )}
            </div>

            {/* Name + description */}
            <div className="px-5 pb-4 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight">{name}</h3>
                    {badges && badges.length > 0 && (
                        <div className="flex items-center gap-1">
                            {badges.map((badge, idx) => <div key={idx}>{badge}</div>)}
                        </div>
                    )}
                    {proOnly && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30">
                            PRO
                        </span>
                    )}
                </div>
                <p className="text-[13px] text-gray-500 dark:text-white/50 leading-relaxed line-clamp-3">
                    {description}
                </p>
            </div>

            {/* Footer button */}
            <div className="px-4 pb-4">
                <div className="h-px bg-gray-100 dark:bg-white/[0.05] mb-3" />
                {isDisabled ? (
                    <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/[0.05] cursor-not-allowed"
                    >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{isLocked ? (disabledReason || t('integrations.requiresPro')) : t('integrations.notAvailableYet')}</span>
                    </button>
                ) : isConfigured ? (
                    <button
                        onClick={onConfigure}
                        className="w-full py-2.5 px-4 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 border border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                        {t('integrations.configuration')}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                ) : (
                    <button
                        onClick={onConfigure}
                        className="w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
                    >
                        {t('integrations.connectAccount')}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                )}
            </div>
        </div>
    );
}
