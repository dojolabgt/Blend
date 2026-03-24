'use client';

import { useRouter } from 'next/navigation';
import { Lock, Sparkles, Zap } from 'lucide-react';
import { usePlanGate } from '@/features/billing/hooks/use-plan-gate';
import type { BooleanPlanFeature } from '@/lib/plan-limits';

const PLAN_LABEL: Record<string, string> = { pro: 'Pro', premium: 'Premium' };
const PLAN_ICON: Record<string, React.ReactNode> = {
    pro: <Zap className="w-3 h-3" />,
    premium: <Sparkles className="w-3 h-3" />,
};
const PLAN_COLOR: Record<string, string> = {
    pro: 'text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-500/30',
    premium: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30',
};

interface PlanGateProps {
    feature: BooleanPlanFeature;
    children: React.ReactNode;
    /**
     * - "overlay"  Show children with a lock overlay on top (default).
     * - "replace"  Replace children entirely with the locked state UI.
     * - "badge"    Render children but append a small plan badge after them.
     */
    mode?: 'overlay' | 'replace' | 'badge';
}

/**
 * Wraps UI elements that require a specific plan tier.
 * When the current workspace plan doesn't meet the requirement,
 * the content is visually blocked and an upgrade CTA is shown.
 *
 * @example
 * <PlanGate feature="googleDrive">
 *   <GoogleDriveSection />
 * </PlanGate>
 *
 * @example
 * <PlanGate feature="brandCustomization" mode="badge">
 *   <BrandColorPicker />
 * </PlanGate>
 */
export function PlanGate({ feature, children, mode = 'overlay' }: PlanGateProps) {
    const { allowed, requiredPlan } = usePlanGate(feature);
    const router = useRouter();

    if (allowed) return <>{children}</>;

    const plan = requiredPlan ?? 'pro';
    const label = PLAN_LABEL[plan] ?? plan;
    const icon = PLAN_ICON[plan];
    const colorCls = PLAN_COLOR[plan] ?? '';

    const badge = (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorCls}`}>
            {icon}
            {label}
        </span>
    );

    const handleUpgrade = () => router.push('/dashboard/settings/billing');

    if (mode === 'badge') {
        return (
            <span className="inline-flex items-center gap-1.5">
                <span className="opacity-40 pointer-events-none select-none">{children}</span>
                {badge}
            </span>
        );
    }

    const lockedState = (
        <div className="flex flex-col items-center justify-center gap-3 py-8 px-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-400 dark:text-white/30" />
            </div>
            <div>
                <div className="mb-1.5">{badge}</div>
                <p className="text-[13px] text-gray-500 dark:text-white/40 mt-1">
                    Esta función está disponible desde el plan <span className="font-semibold">{label}</span>.
                </p>
            </div>
            <button
                onClick={handleUpgrade}
                className="h-8 px-4 rounded-lg text-[12px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
            >
                Ver planes
            </button>
        </div>
    );

    if (mode === 'replace') {
        return lockedState;
    }

    // mode === 'overlay'
    return (
        <div className="relative">
            <div className="opacity-30 pointer-events-none select-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/[0.08] shadow-lg">
                    {lockedState}
                </div>
            </div>
        </div>
    );
}

/**
 * Inline badge-only indicator for plan-locked features.
 * Use when you just need to show the plan badge without wrapping content.
 *
 * @example
 * <label>Color de marca <PlanBadge feature="brandCustomization" /></label>
 */
export function PlanBadge({ feature }: { feature: BooleanPlanFeature }) {
    const { allowed, requiredPlan } = usePlanGate(feature);
    if (allowed) return null;

    const plan = requiredPlan ?? 'pro';
    const label = PLAN_LABEL[plan] ?? plan;
    const icon = PLAN_ICON[plan];
    const colorCls = PLAN_COLOR[plan] ?? '';

    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorCls}`}>
            {icon}
            {label}
        </span>
    );
}
