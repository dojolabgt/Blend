'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, Handshake, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { useDeals, Deal, DealStatus } from '@/hooks/use-deals';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { clientsApi } from '@/features/clients/api';
import { dealsApi } from '@/features/deals/api';
import { Client } from '@/features/clients/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useListState } from '@/hooks/use-list-state';
import { AppSearch } from '@/components/common/AppSearch';
import { AppFilterTabs, FilterOption } from '@/components/common/AppFilterTabs';
import { AppPagination } from '@/components/common/AppPagination';
import { toast } from 'sonner';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    DRAFT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    SENT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    VIEWED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    NEGOTIATING: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
    WON: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
    LOST: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
    const key = status?.toUpperCase() ?? 'DRAFT';
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[key] ?? STATUS_STYLES.DRAFT}`}>
            {label}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealsPage() {
    const { t } = useWorkspaceSettings();
    const { activeWorkspace } = useAuth();

    const STATUS_LABEL: Record<string, string> = {
        DRAFT: t('deals.statusDraft'),
        SENT: t('deals.statusSent'),
        VIEWED: t('deals.statusViewed'),
        NEGOTIATING: t('deals.statusNegotiating'),
        WON: t('deals.statusWon'),
        LOST: t('deals.statusLost'),
    };

    const STATUS_OPTIONS: FilterOption<DealStatus>[] = [
        { label: t('deals.filterAll'), value: undefined },
        { label: t('deals.statusDraft'), value: 'DRAFT' as DealStatus },
        { label: t('deals.statusSent'), value: 'SENT' as DealStatus },
        { label: t('deals.statusViewed'), value: 'VIEWED' as DealStatus },
        { label: t('deals.statusNegotiatingFilter'), value: 'NEGOTIATING' as DealStatus },
        { label: t('deals.statusWon'), value: 'WON' as DealStatus },
        { label: t('deals.statusLost'), value: 'LOST' as DealStatus },
    ];
    const { createDeal, deleteDeal, updateDeal, isLoading: isMutating } = useDeals();
    const router = useRouter();

    const list = useListState<{ status: DealStatus | undefined }>({
        initialFilters: { status: undefined },
    });

    const [deals, setDeals] = useState<Deal[]>([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [clients, setClients] = useState<Client[]>([]);
    const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

    const loadDeals = useCallback(async () => {
        if (!activeWorkspace?.id) return;
        setIsLoading(true);
        try {
            const res = await dealsApi.getAll(activeWorkspace.id, list.query);
            setDeals(res.data);
            setMeta({ total: res.total, totalPages: res.totalPages });
        } catch (error) {
            console.error('Error loading deals', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace?.id, list.query]);

    useEffect(() => {
        loadDeals();
    }, [loadDeals]);

    // Load clients for the create dialog (flat list, high limit)
    useEffect(() => {
        if (activeWorkspace) {
            clientsApi.getAll({ limit: 100 }).then((res) => setClients(res.data)).catch(console.error);
        }
    }, [activeWorkspace]);

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !title) return;
        const deal = await createDeal({ title, clientId });
        if (deal?.id) {
            setIsDialogOpen(false);
            setTitle('');
            setClientId('');
            router.push(`/dashboard/deals/${deal.slug || deal.id}`);
        } else {
            toast.error(t('deals.createError'));
        }
    };

    const handleConfirmDelete = async () => {
        if (!dealToDelete) return;
        const ok = await deleteDeal(dealToDelete.id);
        if (ok) {
            toast.success(t('deals.deleteSuccess'));
            loadDeals();
        } else {
            toast.error(t('deals.deleteError'));
        }
        setDealToDelete(null);
    };

    const getClientName = (deal: Deal) => deal.client?.name ?? '—';

    const getDealTotal = (deal: Deal) => {
        const approved = deal.quotations?.find((q: Record<string, unknown>) => q.isApproved);
        const any = deal.quotations?.[0] as Record<string, unknown> | undefined;
        const total = (approved as Record<string, unknown>)?.total ?? any?.total ?? null;
        if (total === null) return null;
        return Number(total);
    };

    const columns: ColumnDef<Deal>[] = [
        {
            key: 'name',
            header: t('deals.colDeal'),
            render: (deal) => {
                const isShared = !!deal.workspace?.id && deal.workspace.id !== activeWorkspace?.id;
                return (
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="font-semibold group-hover:text-primary transition-colors">
                                {deal.name || t('deals.unknown')}
                            </div>
                            {isShared && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    {t('deals.sharedFrom')} {deal.workspace?.businessName || deal.workspace?.name || '—'}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">{getClientName(deal)}</div>
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: t('deals.colStatus'),
            render: (deal) => {
                const isShared = !!deal.workspace?.id && deal.workspace.id !== activeWorkspace?.id;
                return (
                    <StatusSelect
                        status={deal.status as string ?? 'DRAFT'}
                        statusLabel={STATUS_LABEL}
                        statusStyles={STATUS_STYLES}
                        disabled={isShared}
                        onSelect={async (newStatus) => {
                            const updated = await updateDeal(deal.id, { status: newStatus });
                            if (updated) {
                                setDeals((prev) =>
                                    prev.map((d) => d.id === deal.id ? { ...d, status: newStatus } : d)
                                );
                            }
                        }}
                    />
                );
            },
        },
        {
            key: 'total',
            header: t('deals.total'),
            render: (deal) => {
                const total = getDealTotal(deal);
                const approved = deal.quotations?.find((q: Record<string, unknown>) => q.isApproved) as Record<string, unknown> | undefined;
                const any = deal.quotations?.[0] as Record<string, unknown> | undefined;
                const q = approved || any;
                let symbol = (deal.currency as unknown as { symbol?: string })?.symbol || '$';

                if (q?.currency) {
                    const found = activeWorkspace?.currencies?.find(
                        (c: { code: string; symbol: string }) => c.code === q.currency,
                    );
                    if (found) symbol = found.symbol;
                    else {
                        const fallbacks: Record<string, string> = {
                            GTQ: 'Q', USD: '$', EUR: '€', MXN: '$', GBP: '£',
                        };
                        symbol = fallbacks[q.currency as string] || q.currency as string;
                    }
                }

                return (
                    <span className={total !== null ? 'text-sm font-semibold text-emerald-600 dark:text-emerald-400' : 'text-sm text-zinc-400'}>
                        {total !== null
                            ? `${symbol}${total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
                            : '—'
                        }
                    </span>
                );
            },
        },
        {
            key: 'createdAt',
            header: t('deals.colDate'),
            render: (deal) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(deal.createdAt as string).toLocaleDateString('es-GT')}
                </span>
            ),
        },
    ];

    return (
        <DashboardShell>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('deals.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('deals.pageDesc')}
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="relative z-10 rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> {t('deals.create')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('deals.createDialogTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('deals.createDialogDesc')}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateDeal} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">{t('deals.dealNameLabel')}</Label>
                                <Input
                                    id="title"
                                    placeholder={t('deals.dealNamePlaceholder')}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client">{t('deals.clientLabel')}</Label>
                                <Select value={clientId || undefined} onValueChange={setClientId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('deals.selectClientPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                        {clients.length === 0 && (
                                            <SelectItem value="temp_empty" disabled>
                                                {t('deals.noClientsYet')}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={isMutating || !title || !clientId}>
                                    {isMutating ? t('deals.creatingBtn') : t('deals.startFlowBtn')}{' '}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                data={deals}
                columns={columns}
                isLoading={isLoading}
                emptyIcon={<Handshake className="w-8 h-8" />}
                emptyTitle={t('deals.emptyTitle')}
                emptyDescription={t('deals.emptyDesc')}
                emptyAction={
                    <Button variant="outline" className="rounded-full" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> {t('deals.create')}
                    </Button>
                }
                toolbar={
                    <>
                        <AppSearch
                            value={list.search}
                            onChange={list.setSearch}
                            placeholder={t('deals.searchPlaceholder')}
                            className="w-56"
                        />
                        <AppFilterTabs
                            options={STATUS_OPTIONS}
                            value={list.filters.status}
                            onChange={(v) => list.setFilter('status', v)}
                        />
                    </>
                }
                footer={
                    <AppPagination
                        page={list.page}
                        totalPages={meta.totalPages}
                        total={meta.total}
                        limit={20}
                        onPageChange={list.setPage}
                    />
                }
                onRowClick={(deal) => router.push(`/dashboard/deals/${deal.slug || deal.id}`)}
                actions={(deal) => {
                    const isShared = !!deal.workspace?.id && deal.workspace.id !== activeWorkspace?.id;
                    if (isShared) return [];
                    return [
                        {
                            label: t('common.delete'),
                            icon: <Trash2 className="h-4 w-4" />,
                            onClick: () => setDealToDelete(deal),
                            destructive: true,
                        },
                    ];
                }}
            />

            <AlertDialog open={!!dealToDelete} onOpenChange={(o) => !o && setDealToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deals.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('common.delete')} <strong>&quot;{dealToDelete?.name}&quot;</strong> {t('deals.deleteConfirmDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={handleConfirmDelete}
                        >
                            {t('deals.deleteAction')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardShell>
    );
}

// ─── Inline status selector (same look as the sidebar, works inside the table) ──

interface StatusSelectProps {
    status: string;
    statusLabel: Record<string, string>;
    statusStyles: Record<string, string>;
    disabled?: boolean;
    onSelect: (status: DealStatus) => Promise<void>;
}

const STATUS_ORDER: DealStatus[] = ['DRAFT', 'SENT', 'VIEWED', 'NEGOTIATING', 'WON', 'LOST'];

function StatusSelect({ status, statusLabel, statusStyles, disabled, onSelect }: StatusSelectProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const key = status?.toUpperCase() ?? 'DRAFT';

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + 4, left: rect.left });
        }
        setOpen((o) => !o);
    };

    const handleSelect = async (e: React.MouseEvent, value: DealStatus) => {
        e.stopPropagation();
        if (value === key) { setOpen(false); return; }
        setLoading(true);
        setOpen(false);
        await onSelect(value);
        setLoading(false);
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <button
                ref={btnRef}
                disabled={disabled || loading}
                onClick={handleOpen}
                className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                    statusStyles[key] ?? statusStyles.DRAFT,
                    !disabled && 'hover:opacity-80 cursor-pointer',
                    disabled && 'cursor-default opacity-70',
                )}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                {statusLabel[key] ?? key}
                {!disabled && <ChevronDown className={cn('w-3 h-3 ml-0.5 transition-transform', open && 'rotate-180')} />}
            </button>

            {open && typeof window !== 'undefined' && ReactDOM.createPortal(
                <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
                    <div
                        className="fixed z-50 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
                        style={{ top: dropdownPos.top, left: dropdownPos.left }}
                    >
                        {STATUS_ORDER.map((opt) => (
                            <button
                                key={opt}
                                onClick={(e) => handleSelect(e, opt)}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors',
                                    'hover:bg-zinc-50 dark:hover:bg-zinc-800',
                                    opt === key && 'bg-zinc-50 dark:bg-zinc-800',
                                )}
                            >
                                <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md', statusStyles[opt] ?? statusStyles.DRAFT)}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {statusLabel[opt] ?? opt}
                                </span>
                                {opt === key && <span className="ml-auto text-zinc-400">✓</span>}
                            </button>
                        ))}
                    </div>
                </>,
                document.body,
            )}
        </div>
    );
}
