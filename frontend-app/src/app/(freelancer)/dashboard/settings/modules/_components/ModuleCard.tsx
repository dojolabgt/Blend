'use client';

import { ChevronRight, Lock, Zap } from 'lucide-react';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

// ─── Plan access levels ───────────────────────────────────────────────────────

export type WorkspacePlan = 'free' | 'pro' | 'premium';

export interface ModuleCardProps {
    icon: React.ReactNode;
    name: string;
    tagline: string;
    description: string;
    features: string[];
    category: string;
    requiredPlan: 'pro' | 'premium';
    isActive?: boolean;
    activeModulesCount?: number;
    userPlan: WorkspacePlan;
    onActivate?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModuleCard({
    icon,
    name,
    tagline,
    description,
    features,
    category,
    requiredPlan,
    isActive = false,
    activeModulesCount = 0,
    userPlan,
    onActivate,
}: ModuleCardProps) {
    const { t } = useWorkspaceSettings();

    const planRank: Record<WorkspacePlan, number> = { free: 0, pro: 1, premium: 2 };
    const hasRequiredPlan = planRank[userPlan] >= planRank[requiredPlan];
    const proLimitReached = userPlan === 'pro' && !isActive && activeModulesCount >= 1;
    const isLocked = !hasRequiredPlan || proLimitReached;

    let lockReason = '';
    if (!hasRequiredPlan) {
        lockReason = requiredPlan === 'premium' ? t('modules.requiresPremium') : t('modules.requiresPro');
    } else if (proLimitReached) {
        lockReason = t('modules.proModulesLimit');
    }

    const planBadgeClass = requiredPlan === 'premium'
        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800/30'
        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/30';

    return (
        <div className={`flex flex-col rounded-2xl border transition-all duration-200 ${
            isActive
                ? 'border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#1a1a1a]'
                : isLocked
                    ? 'opacity-70 border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a]'
                    : 'border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-white/[0.1]'
        }`}>

            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border shrink-0 ${
                    isActive
                        ? 'bg-gray-50 dark:bg-white/[0.07] border-gray-200 dark:border-white/[0.1]'
                        : 'bg-gray-50 dark:bg-white/[0.05] border-gray-100 dark:border-white/[0.06]'
                } ${isLocked ? 'grayscale' : ''}`}>
                    {icon}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${planBadgeClass}`}>
                        {requiredPlan}
                    </span>
                    {isActive && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                            <Zap className="w-2.5 h-2.5" />
                            {t('modules.active')}
                        </span>
                    )}
                </div>
            </div>

            {/* Category */}
            <div className="px-5 mb-1">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/35">
                    {category}
                </span>
            </div>

            {/* Name + desc + features */}
            <div className="px-5 pb-4 flex-1 space-y-3">
                <div>
                    <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight leading-tight">{name}</h3>
                    <p className="text-[12px] font-medium text-gray-500 dark:text-white/50 mt-0.5">{tagline}</p>
                </div>
                <p className="text-[13px] text-gray-500 dark:text-white/50 leading-relaxed">{description}</p>
                <ul className="space-y-1.5">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-gray-500 dark:text-white/45">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/25 mt-1.5 shrink-0" />
                            {f}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
                <div className="h-px bg-gray-100 dark:bg-white/[0.05] mb-3" />
                {isLocked ? (
                    <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/[0.05] cursor-not-allowed"
                    >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{lockReason}</span>
                    </button>
                ) : isActive ? (
                    <button
                        onClick={onActivate}
                        className="w-full py-2.5 px-4 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 border border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                        {t('modules.viewConfig')}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                ) : (
                    <button
                        onClick={onActivate}
                        className="w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
                    >
                        {t('modules.activateModule')}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                )}
            </div>
        </div>
    );
}
