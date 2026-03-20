'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Briefcase, Users, FileText, ArrowRight } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDeals } from '@/hooks/use-deals';
import { useProjects } from '@/hooks/use-projects';
import { clientsApi } from '@/features/clients/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

const DEAL_STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Borrador',
    SENT: 'Enviado',
    VIEWED: 'Visto',
    NEGOTIATING: 'Negociando',
    WON: 'Ganado',
    LOST: 'Perdido',
};

const DEAL_STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    SENT: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    VIEWED: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    NEGOTIATING: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    WON: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    LOST: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
};

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    isLoading,
    colorClass = 'bg-zinc-50 dark:bg-zinc-800',
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    isLoading: boolean;
    colorClass?: string;
}) {
    return (
        <div className="bg-white dark:bg-[#121212] rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', colorClass)}>
                    <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
            </div>
            {isLoading ? (
                <Skeleton className="h-7 w-28" />
            ) : (
                <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
            )}
            {sub && <p className="text-xs text-zinc-400 -mt-1">{sub}</p>}
        </div>
    );
}

const sectionClass =
    'bg-white dark:bg-[#121212] rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm overflow-hidden';
const sectionHeaderClass =
    'flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800';
const rowClass =
    'flex items-center gap-3 px-5 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors';

export default function FreelancerDashboardPage() {
    const { user, activeWorkspace } = useAuth();
    const { deals, fetchDeals, isLoading: dealsLoading } = useDeals();
    const { projects, fetchProjects, isLoading: projectsLoading } = useProjects();
    const [clientsTotal, setClientsTotal] = useState<number | null>(null);
    const [clientsLoading, setClientsLoading] = useState(true);

    useEffect(() => {
        fetchDeals();
        fetchProjects();
        setClientsLoading(true);
        clientsApi
            .getAll({ limit: 1 })
            .then((res) => setClientsTotal(res.total ?? 0))
            .catch(() => setClientsTotal(null))
            .finally(() => setClientsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currency =
        activeWorkspace?.currencies?.find((c) => c.isDefault)?.code ?? 'GTQ';

    const pipeline = useMemo(
        () =>
            deals
                .filter((d) => d.status === 'WON' || d.status === 'NEGOTIATING')
                .reduce((sum, d) => sum + (Number(d.value) || 0), 0),
        [deals],
    );

    const activeDealsCount = useMemo(
        () =>
            deals.filter((d) =>
                ['SENT', 'VIEWED', 'NEGOTIATING'].includes(d.status as string),
            ).length,
        [deals],
    );

    const recentDeals = useMemo(
        () =>
            [...deals]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt as string).getTime() -
                        new Date(a.createdAt as string).getTime(),
                )
                .slice(0, 8),
        [deals],
    );

    const firstName = user?.firstName ?? '';

    return (
        <DashboardShell>
            {/* Header */}
            <div className="mb-7">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {firstName ? `Hola, ${firstName}` : 'Dashboard'}
                </h1>
                <p className="text-sm text-zinc-400 mt-0.5">
                    {activeWorkspace?.businessName
                        ? `Resumen de ${activeWorkspace.businessName}`
                        : 'Resumen de tu workspace'}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <StatCard
                    icon={TrendingUp}
                    label="Pipeline"
                    value={formatCurrency(pipeline, currency)}
                    sub="WON + Negociando"
                    isLoading={dealsLoading}
                />
                <StatCard
                    icon={FileText}
                    label="Deals activos"
                    value={dealsLoading ? '—' : String(activeDealsCount)}
                    sub="Enviados, vistos o en negociación"
                    isLoading={dealsLoading}
                />
                <StatCard
                    icon={Briefcase}
                    label="Proyectos"
                    value={projectsLoading ? '—' : String(projects.length)}
                    sub="En curso"
                    isLoading={projectsLoading}
                />
                <StatCard
                    icon={Users}
                    label="Clientes"
                    value={clientsLoading ? '—' : clientsTotal !== null ? String(clientsTotal) : '—'}
                    isLoading={clientsLoading}
                />
            </div>

            {/* Main sections */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Recent deals — wider */}
                <div className={cn(sectionClass, 'lg:col-span-3')}>
                    <div className={sectionHeaderClass}>
                        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Deals recientes
                        </h2>
                        <Button variant="ghost" size="xs" asChild>
                            <Link href="/dashboard/deals" className="text-zinc-400 flex items-center gap-1">
                                Ver todos <ArrowRight className="w-3 h-3" />
                            </Link>
                        </Button>
                    </div>

                    {dealsLoading ? (
                        <div className="p-5 space-y-2.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : recentDeals.length === 0 ? (
                        <div className="py-14 text-center text-sm text-zinc-400">
                            No hay deals todavía.{' '}
                            <Link
                                href="/dashboard/deals"
                                className="text-zinc-600 dark:text-zinc-300 underline underline-offset-2"
                            >
                                Crea el primero
                            </Link>
                            .
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {recentDeals.map((deal) => {
                                const clientName = (deal.client as { name?: string })?.name;
                                const dealValue = deal.value ? Number(deal.value) : null;
                                const dealCurrency = (deal.currency as string) || currency;
                                const status = (deal.status as string) || 'DRAFT';

                                return (
                                    <Link key={deal.id} href={`/dashboard/deals/${deal.id}`} className={rowClass}>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {(deal.title ?? deal.name) as string || 'Sin título'}
                                            </p>
                                            {clientName && (
                                                <p className="text-xs text-zinc-400 truncate mt-0.5">
                                                    {clientName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            {dealValue !== null && dealValue > 0 && (
                                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                                                    {formatCurrency(dealValue, dealCurrency)}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    'text-xs font-medium px-2 py-0.5 rounded-full',
                                                    DEAL_STATUS_COLORS[status] ?? DEAL_STATUS_COLORS.DRAFT,
                                                )}
                                            >
                                                {DEAL_STATUS_LABELS[status] ?? status}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Active projects — narrower */}
                <div className={cn(sectionClass, 'lg:col-span-2')}>
                    <div className={sectionHeaderClass}>
                        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Proyectos activos
                        </h2>
                        <Button variant="ghost" size="xs" asChild>
                            <Link href="/dashboard/projects" className="text-zinc-400 flex items-center gap-1">
                                Ver todos <ArrowRight className="w-3 h-3" />
                            </Link>
                        </Button>
                    </div>

                    {projectsLoading ? (
                        <div className="p-5 space-y-2.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-11 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="py-14 text-center text-sm text-zinc-400">
                            No hay proyectos activos.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {projects.slice(0, 7).map((project) => {
                                const p = project as Record<string, unknown>;
                                const name = ((p.title ?? p.name) as string) || 'Sin título';
                                const clientName =
                                    (p.client as { name?: string })?.name ??
                                    (p.deal as { client?: { name?: string } })?.client?.name;

                                return (
                                    <Link
                                        key={project.id}
                                        href={`/dashboard/projects/${project.id}`}
                                        className={rowClass}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {name}
                                            </p>
                                            {clientName && (
                                                <p className="text-xs text-zinc-400 truncate mt-0.5">
                                                    {clientName}
                                                </p>
                                            )}
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
