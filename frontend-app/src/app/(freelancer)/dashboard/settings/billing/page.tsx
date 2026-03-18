'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { billingApi } from '@/features/billing/api';
import { BillingStatus, BillingSubscription } from '@/features/billing/types';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, XCircle, Clock, Loader2, Check, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(cents: number): string {
    const dollars = cents / 100;
    return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return format(new Date(dateStr), "d 'de' MMMM, yyyy", { locale: es });
}

const STATUS_LABEL: Record<string, { labelKey: string; color: string }> = {
    pending:          { labelKey: 'billing.statusPending',        color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/20' },
    active:           { labelKey: 'billing.statusActive',         color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/20' },
    past_due:         { labelKey: 'billing.statusPastDue',        color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-500/20' },
    cancelled:        { labelKey: 'billing.statusCancelled',      color: 'text-gray-500 bg-gray-50 dark:text-white/40 dark:bg-white/[0.05] border-gray-200 dark:border-white/[0.08]' },
    unable_to_start:  { labelKey: 'billing.statusUnableToStart',  color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-500/20' },
};

// ─── Plan definitions ─────────────────────────────────────────────────────────

const FREE_FEATURES = [
    'Hasta 3 deals activos',
    'Gestión de clientes',
    'Brief digital',
    '1 usuario',
];

const PRO_FEATURES = [
    'Deals ilimitados',
    'Cotizaciones A/B',
    'Branding personalizado',
    'Planes de pago con hitos',
    'Integración Recurrente',
    'Gestión de proyectos y tareas',
];

const PREMIUM_FEATURES = [
    'Todo lo de Pro',
    'Colaboradores ilimitados',
    'Red de workspaces',
    'Splits de ingresos',
    'Soporte prioritario',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
    const { t } = useWorkspaceSettings();
    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [history, setHistory] = useState<BillingSubscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isYearly, setIsYearly] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        async function load() {
            const checkoutId = searchParams?.get('checkout_id');
            const isSuccess = !!searchParams?.get('success');

            if (isSuccess && checkoutId) {
                try {
                    await billingApi.verifyCheckout(checkoutId);
                } catch {
                    // best-effort — webhook may have already handled it
                }
            }

            try {
                const [s, h] = await Promise.all([billingApi.getStatus(), billingApi.getHistory()]);
                setStatus(s);
                setHistory(h);
            } catch {
                toast.error(t('billing.errLoad'));
            } finally {
                setIsLoading(false);
            }
        }
        load();

        if (searchParams?.get('success')) toast.success(t('billing.toastProReady'));
        else if (searchParams?.get('cancelled')) toast.info(t('billing.toastCancelled'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSubscribe = async (plan: 'pro' | 'premium', interval: 'month' | 'year') => {
        setIsSubscribing(true);
        try {
            const { checkoutUrl } = await billingApi.subscribe(plan, interval);
            window.location.href = checkoutUrl;
        } catch {
            toast.error(t('billing.errPayment'));
            setIsSubscribing(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm(t('billing.confirmCancel'))) return;
        setIsCancelling(true);
        try {
            await billingApi.cancel();
            toast.success(t('billing.successCancel'));
            const [s, h] = await Promise.all([billingApi.getStatus(), billingApi.getHistory()]);
            setStatus(s);
            setHistory(h);
        } catch {
            toast.error(t('billing.errCancel'));
        } finally {
            setIsCancelling(false);
        }
    };

    const handleDevOverride = async (plan: 'pro' | 'premium') => {
        setIsSubscribing(true);
        try {
            await billingApi.devOverride(plan);
            toast.success('¡Suscripción forzada (DEV)!');
            const [s, h] = await Promise.all([billingApi.getStatus(), billingApi.getHistory()]);
            setStatus(s);
            setHistory(h);
        } catch {
            toast.error('Error forzando suscripción');
        } finally {
            setIsSubscribing(false);
        }
    };

    const planKey = status?.plan || 'free';
    const isProOrPremium = planKey === 'pro' || planKey === 'premium';
    const activeSubStatus = status?.subscription?.status;
    const isPendingCancel = activeSubStatus === 'cancelled' && status?.planExpiresAt != null && new Date(status.planExpiresAt) > new Date();
    const filteredHistory = history.filter(s => !['pending', 'unable_to_start'].includes(s.status));

    return (
        <div className="px-6 py-6 max-w-3xl">
            <div className="mb-6">
                <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">{t('billing.title')}</h1>
                <p className="text-[13px] text-gray-500 dark:text-white/50 mt-0.5">{t('billing.desc')}</p>
            </div>

            <div className="space-y-6">

                {/* ── Current Plan ── */}
                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {isLoading ? (
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-20 dark:bg-white/[0.07]" />
                                <Skeleton className="h-8 w-36 dark:bg-white/[0.07]" />
                                <Skeleton className="h-3 w-56 dark:bg-white/[0.07]" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-white/40 uppercase mb-2">
                                        {t('billing.currentPlan')}
                                    </p>
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span className="text-[26px] font-black tracking-tight text-gray-900 dark:text-white capitalize">
                                            Hi Krew {planKey}
                                        </span>
                                        {planKey === 'premium' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full">
                                                <Sparkles className="w-3 h-3" /> Premium
                                            </span>
                                        ) : planKey === 'pro' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-500/20 px-2.5 py-1 rounded-full">
                                                <Sparkles className="w-3 h-3" /> Pro
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-semibold text-gray-500 dark:text-white/40 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] px-2.5 py-1 rounded-full">
                                                Free
                                            </span>
                                        )}
                                    </div>
                                    {isProOrPremium && status?.planExpiresAt ? (
                                        <p className="text-[12px] text-gray-500 dark:text-white/50 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {t('billing.cycleEnds')} <span className="text-gray-700 dark:text-white/70 ml-1">{formatDate(status.planExpiresAt)}</span>
                                        </p>
                                    ) : (
                                        <p className="text-[12px] text-gray-500 dark:text-white/50">{t('billing.freeDesc')}</p>
                                    )}
                                    {isPendingCancel && (
                                        <span className="mt-2 inline-block text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full">
                                            {t('billing.cancelling')}
                                        </span>
                                    )}
                                </div>
                                {isProOrPremium && activeSubStatus === 'active' && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCancelling}
                                        className="flex items-center gap-2 h-9 px-5 rounded-xl border border-red-200 dark:border-red-900/40 text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40 shrink-0"
                                    >
                                        {isCancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                        {t('billing.btnCancel')}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── Plan Cards ── */}
                {!isLoading && (
                    <div className="space-y-5">
                        {/* Header + toggle */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">{t('billing.choosePlan')}</h2>
                                <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('billing.choosePlanDesc')}</p>
                            </div>
                            {/* Monthly / Yearly toggle */}
                            <div className="flex items-center bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl border border-gray-200 dark:border-white/[0.08] self-start sm:self-auto shrink-0">
                                <button
                                    onClick={() => setIsYearly(false)}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200',
                                        !isYearly
                                            ? 'bg-white dark:bg-white/[0.1] text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/65'
                                    )}
                                >
                                    {t('billing.monthly')}
                                </button>
                                <button
                                    onClick={() => setIsYearly(true)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200',
                                        isYearly
                                            ? 'bg-white dark:bg-white/[0.1] text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/65'
                                    )}
                                >
                                    {t('billing.yearly')}
                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                                        {t('billing.save16')}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Cards grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

                            {/* ── FREE ── */}
                            <div className="flex flex-col rounded-2xl p-6 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                                <p className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-white/30 uppercase mb-4">Free</p>
                                <div className="flex items-baseline gap-1.5 mb-1">
                                    <span className="text-[40px] font-black leading-none tracking-tight text-gray-900 dark:text-white">$0</span>
                                </div>
                                <p className="text-[12px] text-gray-400 dark:text-white/30 mb-6">para siempre</p>
                                <div className="h-px bg-gray-100 dark:bg-white/[0.06] mb-5" />
                                <ul className="space-y-2.5 mb-6 flex-1">
                                    {FREE_FEATURES.map(f => (
                                        <li key={f} className="flex items-center gap-2.5 text-[12px] text-gray-600 dark:text-white/55">
                                            <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center shrink-0">
                                                <Check className="h-2.5 w-2.5 text-gray-400 dark:text-white/40" strokeWidth={3} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    disabled
                                    className="w-full h-10 rounded-xl text-[13px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/30 cursor-default"
                                >
                                    {planKey === 'free' ? t('billing.yourPlan') : t('billing.freeSub')}
                                </button>
                            </div>

                            {/* ── PRO (featured) ── */}
                            <div className="relative flex flex-col rounded-2xl p-6 bg-white text-gray-900 shadow-xl shadow-black/10 dark:shadow-black/40 border border-gray-100 md:-mt-3 md:mb-3">
                                {/* Popular badge */}
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-white/[0.12]">
                                        <Zap className="h-2.5 w-2.5 fill-white" strokeWidth={0} />
                                        Popular
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4 mt-1">Pro</p>
                                <div className="flex items-baseline gap-1.5 mb-1">
                                    {status?.prices ? (
                                        <span className="text-[40px] font-black leading-none tracking-tight text-gray-900">
                                            {isYearly ? formatUSD(Math.round(status.prices.pro.yearly / 12)) : formatUSD(status.prices.pro.monthly)}
                                        </span>
                                    ) : <Skeleton className="h-10 w-20" />}
                                    <span className="text-[13px] text-gray-400">/ mes</span>
                                </div>
                                <p className="text-[12px] text-gray-400 mb-6">
                                    {isYearly ? `${formatUSD(status?.prices?.pro.yearly ?? 0)} / año` : t('billing.billedMonthly')}
                                </p>
                                <div className="h-px bg-gray-100 mb-5" />
                                <ul className="space-y-2.5 mb-6 flex-1">
                                    {PRO_FEATURES.map(f => (
                                        <li key={f} className="flex items-center gap-2.5 text-[12px] text-gray-700">
                                            <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <Check className="h-2.5 w-2.5 text-gray-500" strokeWidth={3} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {planKey === 'pro' ? (
                                    <button disabled className="w-full h-10 rounded-xl text-[13px] font-semibold bg-gray-100 text-gray-400 cursor-default">
                                        {t('billing.yourPlan')}
                                    </button>
                                ) : planKey === 'premium' ? (
                                    <button disabled className="w-full h-10 rounded-xl text-[13px] font-semibold bg-gray-100 text-gray-400 cursor-default">
                                        {t('billing.includedPremium')}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleSubscribe('pro', isYearly ? 'year' : 'month')}
                                            disabled={isSubscribing}
                                            className="w-full h-10 rounded-xl text-[13px] font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                                        >
                                            {isSubscribing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                            {t('billing.upgradePro')}
                                        </button>
                                        {process.env.NODE_ENV === 'development' && (
                                            <button onClick={() => handleDevOverride('pro')} disabled={isSubscribing} className="w-full h-8 rounded-xl text-[11px] font-semibold border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                                                [DEV] Activar Inmediato
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── PREMIUM ── */}
                            <div className="flex flex-col rounded-2xl p-6 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                                <p className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-white/30 uppercase mb-4">Premium</p>
                                <div className="flex items-baseline gap-1.5 mb-1">
                                    {status?.prices ? (
                                        <span className="text-[40px] font-black leading-none tracking-tight text-gray-900 dark:text-white">
                                            {isYearly ? formatUSD(Math.round(status.prices.premium.yearly / 12)) : formatUSD(status.prices.premium.monthly)}
                                        </span>
                                    ) : <Skeleton className="h-10 w-20 dark:bg-white/[0.07]" />}
                                    <span className="text-[13px] text-gray-400 dark:text-white/30">/ mes</span>
                                </div>
                                <p className="text-[12px] text-gray-400 dark:text-white/30 mb-6">
                                    {isYearly ? `${formatUSD(status?.prices?.premium.yearly ?? 0)} / año` : t('billing.billedMonthly')}
                                </p>
                                <div className="h-px bg-gray-100 dark:bg-white/[0.06] mb-5" />
                                <ul className="space-y-2.5 mb-6 flex-1">
                                    {PREMIUM_FEATURES.map(f => (
                                        <li key={f} className="flex items-center gap-2.5 text-[12px] text-gray-600 dark:text-white/55">
                                            <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center shrink-0">
                                                <Check className="h-2.5 w-2.5 text-gray-400 dark:text-white/40" strokeWidth={3} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {planKey === 'premium' ? (
                                    <button disabled className="w-full h-10 rounded-xl text-[13px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/30 cursor-default">
                                        {t('billing.yourPlan')}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleSubscribe('premium', isYearly ? 'year' : 'month')}
                                            disabled={isSubscribing}
                                            className="w-full h-10 rounded-xl text-[13px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                                        >
                                            {isSubscribing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                            {planKey === 'pro' ? t('billing.upgradePremium') : t('billing.buyPremium')}
                                        </button>
                                        {process.env.NODE_ENV === 'development' && (
                                            <button onClick={() => handleDevOverride('premium')} disabled={isSubscribing} className="w-full h-8 rounded-xl text-[11px] font-semibold border border-gray-100 dark:border-white/[0.08] text-gray-400 dark:text-white/30 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                                                [DEV] Activar Inmediato
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>

                        <p className="text-center text-[11px] text-gray-400 dark:text-white/30">
                            Precios en USD · Sin contratos · Cancela cuando quieras
                        </p>
                    </div>
                )}

                {/* ── Billing History ── */}
                {filteredHistory.length > 0 && (
                    <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('billing.history')}</h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                            {filteredHistory.map((sub) => {
                                const st = STATUS_LABEL[sub.status] ?? { labelKey: sub.status, color: '' };
                                return (
                                    <div key={sub.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[13px] font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                                                Hi Krew {(sub as unknown as { plan?: string }).plan || 'Pro'}
                                                <span className="text-[10px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-wider">
                                                    {sub.interval === 'month' ? t('billing.monthly') : t('billing.yearly')}
                                                </span>
                                            </p>
                                            <p className="text-[12px] text-gray-500 dark:text-white/40 mt-0.5">{formatDate(sub.createdAt)}</p>
                                        </div>
                                        <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0', st.color)}>
                                            {sub.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                                            {sub.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                                            {t(st.labelKey)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-2xl dark:bg-white/[0.05]" />
                        <Skeleton className="h-64 w-full rounded-2xl dark:bg-white/[0.05]" />
                    </div>
                )}
            </div>
        </div>
    );
}
