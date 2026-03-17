'use client';

import { useState, useEffect, useCallback } from 'react';
import { servicesApi } from '@/features/services/api';
import { Service, ServiceChargeType, ServiceUnitType } from '@/features/services/types';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Plus, Package, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { ServiceModal } from './_components/ServiceModal';
import { toast } from 'sonner';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useListState } from '@/hooks/use-list-state';
import { AppSearch } from '@/components/common/AppSearch';
import { AppFilterTabs, FilterOption } from '@/components/common/AppFilterTabs';
import { AppPagination } from '@/components/common/AppPagination';

// ─── Helpers ────────────────────────────────────────────────────────────────

const CHARGE_TYPE_LABEL: Record<ServiceChargeType, string> = {
    [ServiceChargeType.ONE_TIME]: 'Único',
    [ServiceChargeType.HOURLY]: 'Por hora',
    [ServiceChargeType.RECURRING]: 'Recurrente',
};

const UNIT_TYPE_LABEL: Record<ServiceUnitType, string> = {
    [ServiceUnitType.HOUR]: 'Hora',
    [ServiceUnitType.PROJECT]: 'Proyecto',
    [ServiceUnitType.MONTH]: 'Mes',
    [ServiceUnitType.UNIT]: 'Unidad',
};

const CHARGE_TYPE_OPTIONS: FilterOption<ServiceChargeType>[] = [
    { label: 'Todos', value: undefined },
    { label: 'Único', value: ServiceChargeType.ONE_TIME },
    { label: 'Por hora', value: ServiceChargeType.HOURLY },
    { label: 'Recurrente', value: ServiceChargeType.RECURRING },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
    const { formatCurrency, t } = useWorkspaceSettings();

    const list = useListState<{ chargeType: ServiceChargeType | undefined }>({
        initialFilters: { chargeType: undefined },
    });

    const [services, setServices] = useState<Service[]>([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const loadServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await servicesApi.getAll(list.query);
            setServices(res.data);
            setMeta({ total: res.total, totalPages: res.totalPages });
        } catch (error) {
            console.error('Error loading services', error);
        } finally {
            setIsLoading(false);
        }
    }, [list.query]);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;
        try {
            await servicesApi.delete(id);
            toast.success(t('common.deleted') || 'Servicio eliminado');
            loadServices();
        } catch {
            toast.error(t('common.error') || 'Error al eliminar el servicio');
        }
    };

    const handleCreate = () => {
        setEditingService(null);
        setModalOpen(true);
    };

    const columns: ColumnDef<Service>[] = [
        {
            key: 'name',
            header: t('services.colName'),
            render: (service) => (
                <div>
                    <div className={`font-medium group-hover:text-primary transition-colors ${!service.isActive ? 'text-muted-foreground' : ''}`}>
                        {service.name}
                        {!service.isActive && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">(inactivo)</span>
                        )}
                    </div>
                    {service.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                            {service.description}
                        </div>
                    )}
                    {service.sku && (
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            SKU: {service.sku}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'category',
            header: t('services.colCategory'),
            render: (service) => (
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {service.category || 'General'}
                </span>
            ),
        },
        {
            key: 'chargeType',
            header: 'Tipo de cobro',
            render: (service) => (
                <div className="text-sm text-muted-foreground">
                    <div>{CHARGE_TYPE_LABEL[service.chargeType] ?? service.chargeType}</div>
                    <div className="text-xs">por {UNIT_TYPE_LABEL[service.unitType] ?? service.unitType}</div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Estado',
            render: (service) =>
                service.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5" /> Inactivo
                    </span>
                ),
        },
        {
            key: 'price',
            header: t('services.colPrice'),
            className: 'text-right',
            render: (service) => {
                if (!service.basePrice || Object.keys(service.basePrice).length === 0)
                    return <span className="font-mono font-medium text-muted-foreground">-</span>;

                const prices = Object.entries(service.basePrice)
                    .filter(([, value]) => value !== null && value !== undefined && (value as number) > 0)
                    .map(([currency, value]) => formatCurrency(value as number, currency));

                return (
                    <div className="flex flex-col items-end gap-1">
                        {prices.length > 0
                            ? prices.map((p, i) => (
                                <span key={i} className="font-mono font-medium text-xs whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                    {p}
                                </span>
                            ))
                            : <span className="font-mono font-medium text-muted-foreground">-</span>
                        }
                    </div>
                );
            },
        },
    ];

    return (
        <DashboardShell>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('services.title')}</h1>
                    <p className="text-muted-foreground">{t('services.titleDesc')}</p>
                </div>
                <Button
                    type="button"
                    onClick={handleCreate}
                    className="relative z-10 rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <Plus className="mr-2 h-4 w-4" /> {t('services.create')}
                </Button>
            </div>

            <DataTable
                data={services}
                columns={columns}
                isLoading={isLoading}
                emptyIcon={<Package className="w-8 h-8" />}
                emptyTitle={t('services.emptyTitle')}
                emptyDescription={t('services.emptyDesc')}
                emptyAction={
                    <Button variant="outline" className="rounded-full" onClick={handleCreate}>
                        {t('services.emptyBtn')}
                    </Button>
                }
                toolbar={
                    <>
                        <AppSearch
                            value={list.search}
                            onChange={list.setSearch}
                            placeholder="Buscar servicios..."
                            className="w-56"
                        />
                        <AppFilterTabs
                            options={CHARGE_TYPE_OPTIONS}
                            value={list.filters.chargeType}
                            onChange={(v) => list.setFilter('chargeType', v)}
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
                actions={(service) => [
                    {
                        label: t('common.edit') || 'Editar',
                        icon: <Edit2 className="h-4 w-4" />,
                        onClick: () => handleEdit(service),
                    },
                    {
                        label: t('common.delete') || 'Eliminar',
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => handleDelete(service.id),
                        destructive: true,
                    },
                ]}
            />

            <ServiceModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={loadServices}
                initialData={editingService ?? undefined}
            />
        </DashboardShell>
    );
}
