'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { usePaymentPlan } from '@/hooks/use-payment-plan';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { projectsApi } from '@/features/projects/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, BadgeCheck, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProjectData } from '../layout';

const fmt = (val: number) =>
    Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    PAID:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    OVERDUE: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    CANCELLED: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',
};

interface Props {
    project: ProjectData;
    isOwner: boolean;
    isViewer?: boolean;
    onUpdate: () => void;
}

type Milestone = {
    id: string; name: string; amount: number;
    percentage?: number; status: string; dueDate?: string; description?: string;
};

// ─── Shared milestone list ────────────────────────────────────────────────────

function MilestoneList({
    milestones, sym, totalAmount, isOwner, isViewer, onMarkPaid, t,
}: {
    milestones: Milestone[]; sym: string; totalAmount: number;
    isOwner: boolean; isViewer?: boolean;
    onMarkPaid: (id: string) => void; t: (k: string) => string;
}) {
    const paidTotal = milestones.filter(m => m.status === 'PAID').reduce((s, m) => s + Number(m.amount), 0);
    const pct = totalAmount > 0 ? Math.round((paidTotal / totalAmount) * 100) : 0;

    return (
        <div className="space-y-4">
            {totalAmount > 0 && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{t('payments.progressLabel')}</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                            {sym}{fmt(paidTotal)} / {sym}{fmt(totalAmount)}
                        </span>
                    </div>
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-right text-xs text-zinc-400 mt-1">{pct}% {t('payments.collected')}</p>
                </div>
            )}

            <div className="space-y-2">
                {milestones.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            'flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors',
                            m.status === 'PAID'
                                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800',
                        )}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', STATUS_STYLES[m.status ?? 'PENDING'])}>
                                {m.status === 'PAID' && <BadgeCheck className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{m.name}</p>
                                {m.dueDate && (
                                    <p className="text-[11px] text-zinc-400">{new Date(m.dueDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-base font-bold text-zinc-900 dark:text-white">{sym}{fmt(Number(m.amount))}</span>
                            <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold', STATUS_STYLES[m.status ?? 'PENDING'])}>
                                {t(`payments.status${m.status ?? 'PENDING'}`)}
                            </span>
                            {isOwner && !isViewer && (
                                <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => onMarkPaid(m.id)}>
                                    {m.status === 'PAID' ? t('payments.unmarkPaid') : t('payments.markPaid')}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Add milestone inline form ────────────────────────────────────────────────

function AddMilestoneForm({
    sym, onAdd, onCancel, t,
}: {
    sym: string; onAdd: (name: string, amount: number) => Promise<void>;
    onCancel: () => void; t: (k: string) => string;
}) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !amount) return;
        setSaving(true);
        try {
            await onAdd(name.trim(), Number(amount));
            setName(''); setAmount('');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
                        {t('payments.milestoneNameLabel')}
                    </label>
                    <Input
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder={t('payments.milestoneNamePlaceholder')}
                        required autoFocus className="text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
                        {t('payments.milestoneAmountLabel')} ({sym})
                    </label>
                    <Input
                        type="number" min={0} step="0.01" value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00" required className="text-sm"
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving} className="text-xs">
                    {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    {t('payments.milestoneAddBtn')}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="text-xs">
                    {t('payments.milestoneCancelBtn')}
                </Button>
            </div>
        </form>
    );
}

// ─── Deal-based plan ──────────────────────────────────────────────────────────

function DealPaymentPlan({ project, isOwner, isViewer, onUpdate }: Props) {
    const { t } = useWorkspaceSettings();
    const { activeWorkspace } = useAuth();
    const dealId = project.deal?.id ?? '';
    const { plan, updateMilestone, fetchPaymentPlan } = usePaymentPlan(dealId, project.workspaceId);
    const [markPaidId, setMarkPaidId] = useState<string | null>(null);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => { if (dealId) fetchPaymentPlan(); }, [dealId, fetchPaymentPlan]);

    const sym = (() => {
        const q = project.deal?.quotations?.find(q => q.isApproved) ?? project.deal?.quotations?.[0];
        let s = project.deal?.currency?.symbol ?? '$';
        if (q?.currency && activeWorkspace?.currencies?.length) {
            const found = activeWorkspace.currencies.find((c: { code: string; symbol: string }) => c.code === q.currency);
            if (found) s = found.symbol;
        }
        return s;
    })();

    const handleMarkAsPaid = async () => {
        if (!markPaidId) return;
        setIsMarkingPaid(true);
        const milestone = plan?.milestones?.find(m => m.id === markPaidId);
        const newStatus = milestone?.status === 'PAID' ? 'PENDING' : 'PAID';
        await updateMilestone(markPaidId, { status: newStatus });
        setMarkPaidId(null);
        setIsMarkingPaid(false);
        await fetchPaymentPlan();
        onUpdate();
        toast.success(newStatus === 'PAID' ? t('payments.markedPaid') : t('payments.markedPending'));
    };

    if (!plan) {
        return (
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                <CreditCard className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-500 mb-1">{t('payments.noPlan')}</p>
                <p className="text-xs text-zinc-400">{t('payments.noPlanDealHint')}</p>
            </div>
        );
    }

    return (
        <>
            {showAdd && (
                <AddMilestoneForm sym={sym} t={t} onCancel={() => setShowAdd(false)}
                    onAdd={async (name, amount) => {
                        // Deal milestones added via deal API — not implemented here yet
                        toast.info('Usa el módulo de deals para agregar hitos al plan de pago del deal.');
                        setShowAdd(false);
                    }}
                />
            )}
            <MilestoneList
                milestones={plan.milestones ?? []} sym={sym}
                totalAmount={plan.totalAmount} isOwner={isOwner} isViewer={isViewer}
                onMarkPaid={setMarkPaidId} t={t}
            />
            <AlertDialog open={!!markPaidId} onOpenChange={o => !o && setMarkPaidId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('payments.confirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('payments.confirmDesc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('payments.confirmCancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkAsPaid} disabled={isMarkingPaid}>
                            {isMarkingPaid && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('payments.confirmAccept')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// ─── Standalone plan ──────────────────────────────────────────────────────────

function StandalonePaymentPlan({ project, isOwner, isViewer, onUpdate }: Props) {
    const { activeWorkspace } = useAuth();
    const { t } = useWorkspaceSettings();
    const [plan, setPlan] = useState(project.directPaymentPlan ?? null);
    const [markPaidId, setMarkPaidId] = useState<string | null>(null);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const sym = (() => {
        const code = project.currency;
        if (!code) return '$';
        const found = activeWorkspace?.currencies?.find((c: { code: string; symbol: string }) => c.code === code);
        if (found) return found.symbol;
        const fb: Record<string, string> = { GTQ: 'Q', USD: '$', EUR: '€', MXN: '$', GBP: '£' };
        return fb[code] ?? code;
    })();

    const refresh = useCallback(async () => {
        if (!activeWorkspace?.id) return;
        try { setPlan(await projectsApi.getPaymentPlan(activeWorkspace.id, project.id)); }
        catch { setPlan(null); }
    }, [activeWorkspace?.id, project.id]);

    const handleAdd = async (name: string, amount: number) => {
        if (!activeWorkspace?.id) return;
        try {
            if (!plan) {
                await projectsApi.createOrUpdatePaymentPlan(activeWorkspace.id, project.id, {
                    milestones: [{ name, amount }],
                });
            } else {
                await projectsApi.addMilestone(activeWorkspace.id, project.id, { name, amount });
            }
            await refresh();
            setShowAdd(false);
            toast.success(t('payments.milestoneAdded'));
        } catch {
            toast.error(t('payments.milestoneAddError'));
        }
    };

    const handleMarkAsPaid = async () => {
        if (!markPaidId || !activeWorkspace?.id) return;
        setIsMarkingPaid(true);
        const milestone = plan?.milestones?.find(m => m.id === markPaidId);
        const newStatus = milestone?.status === 'PAID' ? 'PENDING' : 'PAID';
        try {
            await projectsApi.updateMilestone(activeWorkspace.id, project.id, markPaidId, { status: newStatus });
            await refresh();
            onUpdate();
            toast.success(newStatus === 'PAID' ? t('payments.markedPaid') : t('payments.markedPending'));
        } catch {
            toast.error(t('payments.updateError'));
        } finally {
            setIsMarkingPaid(false);
            setMarkPaidId(null);
        }
    };

    const milestones = plan?.milestones ?? [];

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{t('payments.milestonesTitle')}</h3>
                    <p className="text-[12px] text-zinc-500">{t('payments.milestonesDesc')}</p>
                </div>
                {isOwner && !isViewer && (
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(v => !v)} className="gap-1.5 text-xs">
                        <Plus className="w-3.5 h-3.5" />
                        {t('payments.addMilestoneBtn')}
                    </Button>
                )}
            </div>

            {showAdd && (
                <AddMilestoneForm sym={sym} t={t} onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
            )}

            {milestones.length > 0 ? (
                <MilestoneList
                    milestones={milestones} sym={sym} totalAmount={plan!.totalAmount}
                    isOwner={isOwner} isViewer={isViewer} onMarkPaid={setMarkPaidId} t={t}
                />
            ) : (
                <div className="p-8 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                    <CreditCard className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-zinc-500 mb-1">{t('payments.noMilestones')}</p>
                    <p className="text-xs text-zinc-400">{t('payments.noMilestonesHint')}</p>
                    {isOwner && !isViewer && (
                        <Button size="sm" variant="outline" className="mt-4 gap-1.5 text-xs" onClick={() => setShowAdd(true)}>
                            <Plus className="w-3.5 h-3.5" />
                            {t('payments.addMilestoneBtn')}
                        </Button>
                    )}
                </div>
            )}

            <AlertDialog open={!!markPaidId} onOpenChange={o => !o && setMarkPaidId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('payments.confirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('payments.confirmDesc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('payments.confirmCancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkAsPaid} disabled={isMarkingPaid}>
                            {isMarkingPaid && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('payments.confirmAccept')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function ProjectPaymentsTab({ project, isOwner, isViewer, onUpdate }: Props) {
    const { t } = useWorkspaceSettings();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t('payments.title')}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{t('payments.titleDesc')}</p>
            </div>

            {project.dealId ? (
                <DealPaymentPlan project={project} isOwner={isOwner} isViewer={isViewer} onUpdate={onUpdate} />
            ) : (
                <StandalonePaymentPlan project={project} isOwner={isOwner} isViewer={isViewer} onUpdate={onUpdate} />
            )}
        </div>
    );
}
