'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, ArrowRight, Lock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import type { PlanLimitError } from '@/lib/plan-limits';

const PLAN_LABEL: Record<string, string> = {
    PRO: 'Pro',
    PREMIUM: 'Premium',
    FREE: 'Free',
};

const PLAN_ICON: Record<string, React.ReactNode> = {
    PRO: <Zap className="w-3.5 h-3.5" />,
    PREMIUM: <Sparkles className="w-3.5 h-3.5" />,
};

const PLAN_COLOR: Record<string, string> = {
    PRO: 'text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-500/30',
    PREMIUM: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30',
};

const BUTTON_COLOR: Record<string, string> = {
    PRO: 'bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600',
    PREMIUM: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
};

/**
 * Global dialog that automatically opens when the API returns a 403
 * PLAN_LIMIT_REACHED or FEATURE_NOT_AVAILABLE error.
 *
 * Mount this once in the root layout (inside AuthProvider).
 */
export function UpgradeDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<PlanLimitError | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<PlanLimitError>).detail;
            if (detail) {
                setError(detail);
                setOpen(true);
            }
        };
        window.addEventListener('plan-limit-reached', handler);
        return () => window.removeEventListener('plan-limit-reached', handler);
    }, []);

    const requiredPlan = error?.requiredPlan ?? 'PRO';
    const planLabel = PLAN_LABEL[requiredPlan] ?? requiredPlan;
    const planColorCls = PLAN_COLOR[requiredPlan] ?? '';
    const buttonColorCls = BUTTON_COLOR[requiredPlan] ?? 'bg-gray-900 hover:bg-gray-700';

    const handleUpgrade = () => {
        setOpen(false);
        router.push('/dashboard/settings/billing');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden gap-0" showCloseButton>
                {/* Header accent */}
                <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-amber-400" />

                <div className="p-6 pb-0">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center shrink-0">
                                <Lock className="w-5 h-5 text-gray-500 dark:text-white/50" />
                            </div>
                            <div>
                                <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${planColorCls}`}>
                                    {PLAN_ICON[requiredPlan]}
                                    {planLabel} requerido
                                </div>
                            </div>
                        </div>

                        <DialogTitle className="text-[16px] font-bold text-gray-900 dark:text-white leading-snug">
                            {error?.code === 'PLAN_LIMIT_REACHED'
                                ? 'Alcanzaste el límite de tu plan'
                                : 'Esta función no está disponible'}
                        </DialogTitle>

                        <DialogDescription className="text-[13px] text-gray-500 dark:text-white/50 mt-1 leading-relaxed">
                            {error?.message}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Limit detail pill */}
                    {error?.code === 'PLAN_LIMIT_REACHED' && typeof error.current === 'number' && typeof error.limit === 'number' && (
                        <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Uso actual</span>
                                    <span className="text-[11px] font-bold text-gray-700 dark:text-white/70">
                                        {error.current} / {error.limit}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                                        style={{ width: `${Math.min((error.current / error.limit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 flex-col gap-2">
                    <button
                        onClick={handleUpgrade}
                        className={`w-full h-10 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-colors ${buttonColorCls}`}
                    >
                        Ver plan {planLabel}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-full h-9 rounded-xl text-[13px] font-medium text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 transition-colors"
                    >
                        Ahora no
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
