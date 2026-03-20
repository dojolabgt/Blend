'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBriefTemplates, BriefTemplate } from '@/hooks/use-brief-templates';
import { briefTemplatesApi } from '@/features/brief-templates/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Settings2, ArrowLeft, ChevronRight } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useListState } from '@/hooks/use-list-state';
import { AppSearch } from '@/components/common/AppSearch';
import { AppFilterTabs, FilterOption } from '@/components/common/AppFilterTabs';
import { AppPagination } from '@/components/common/AppPagination';
import { BriefBuilder } from './_components/BriefBuilder';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { DashboardShell } from '@/components/layout/DashboardShell';

// ─── Filter options ───────────────────────────────────────────────────────────

type ActiveFilter = 'true' | 'false';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BriefTemplatesPage() {
    const searchParams = useSearchParams();
    const editParam = searchParams.get('edit');
    const { activeWorkspace } = useAuth();
    const { t } = useWorkspaceSettings();

    const ACTIVE_OPTIONS: FilterOption<ActiveFilter>[] = [
        { label: t('briefTemplates.filterAll'), value: undefined },
        { label: t('briefTemplates.filterActive'), value: 'true' },
        { label: t('briefTemplates.filterInactive'), value: 'false' },
    ];
    const { createTemplate } = useBriefTemplates();

    const list = useListState<{ isActive: ActiveFilter | undefined }>({
        initialFilters: { isActive: undefined },
    });

    const [templates, setTemplates] = useState<BriefTemplate[]>([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTplName, setNewTplName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<BriefTemplate | null>(null);

    const loadTemplates = useCallback(async () => {
        if (!activeWorkspace?.id || editingTemplate) return;
        setIsLoading(true);
        try {
            const res = await briefTemplatesApi.getAll(activeWorkspace.id, list.query);
            setTemplates(res.data);
            setMeta({ total: res.total, totalPages: res.totalPages });
        } catch (error) {
            console.error('Error loading templates', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace?.id, list.query, editingTemplate]);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // Open template from ?edit= query param once templates load
    useEffect(() => {
        if (editParam && templates.length > 0 && !editingTemplate) {
            const found = templates.find((t) => t.id === editParam);
            if (found) setEditingTemplate(found);
        }
    }, [editParam, templates, editingTemplate]);

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTplName) return;
        setIsCreating(true);
        try {
            const res = await createTemplate({
                name: newTplName,
                description: t('briefTemplates.customDescription'),
                schema: [],
                isActive: true,
            });
            if (res?.id) {
                toast.success(t('briefTemplates.createSuccess'));
                setNewTplName('');
                setIsDialogOpen(false);
                setEditingTemplate(res);
            }
        } catch (err: unknown) {
            toast.error((err as Error).message || t('briefTemplates.createError'));
        } finally {
            setIsCreating(false);
        }
    };

    // ── Builder view ──────────────────────────────────────────────────────────
    if (editingTemplate) {
        return (
            <div className="h-full flex flex-col">
                {/* Breadcrumb — same visual language as the list header */}
                <div className="bg-[#FDFDFD] dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setEditingTemplate(null)}
                        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        <span>{t('briefTemplates.pageTitle')}</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                        {editingTemplate.name}
                    </span>
                    <span className={`ml-1 px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${editingTemplate.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {editingTemplate.isActive ? t('briefTemplates.statusActive') : t('briefTemplates.statusInactive')}
                    </span>
                </div>
                <div className="flex-1 min-h-0 p-5">
                    <BriefBuilder template={editingTemplate} onClose={() => setEditingTemplate(null)} />
                </div>
            </div>
        );
    }

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns: ColumnDef<BriefTemplate>[] = [
        {
            key: 'name',
            header: t('briefTemplates.colName'),
            render: (tpl) => (
                <div>
                    <div className={`font-medium ${!tpl.isActive ? 'text-muted-foreground' : ''}`}>
                        {tpl.name}
                    </div>
                    {tpl.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {tpl.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'questions',
            header: t('briefTemplates.colQuestions'),
            render: (tpl) => (
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {tpl.schema?.length || 0} {t('briefTemplates.colFields')}
                </span>
            ),
        },
        {
            key: 'status',
            header: t('briefTemplates.colStatus'),
            render: (tpl) => (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tpl.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                    {tpl.isActive ? t('briefTemplates.statusActive') : t('briefTemplates.statusInactive')}
                </span>
            ),
        },
        {
            key: 'action',
            header: '',
            className: 'text-right',
            render: (tpl) => (
                <div className="flex justify-end items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate(tpl);
                        }}
                    >
                        <Settings2 className="w-4 h-4 mr-2 text-zinc-500" />
                        {t('briefTemplates.configureBtn')}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DashboardShell>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t('briefTemplates.pageTitle')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('briefTemplates.pageDesc')}
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-sm">
                            <Plus className="w-4 h-4 mr-2" /> {t('briefTemplates.newBtn')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('briefTemplates.createDialogTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('briefTemplates.createDialogDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTemplate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>{t('briefTemplates.nameLabel')}</Label>
                                <Input
                                    value={newTplName}
                                    onChange={(e) => setNewTplName(e.target.value)}
                                    placeholder={t('briefTemplates.namePlaceholder')}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isCreating}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={!newTplName || isCreating}>
                                    {isCreating ? t('briefTemplates.creatingBtn') : t('briefTemplates.createContinueBtn')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                data={templates}
                columns={columns}
                isLoading={isLoading}
                emptyIcon={<FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />}
                emptyTitle={t('briefTemplates.emptyTitle')}
                emptyDescription={t('briefTemplates.emptyDesc')}
                emptyAction={
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" /> {t('briefTemplates.emptyBtn')}
                    </Button>
                }
                toolbar={
                    <>
                        <AppSearch
                            value={list.search}
                            onChange={list.setSearch}
                            placeholder={t('briefTemplates.searchPlaceholder')}
                            className="w-56"
                        />
                        <AppFilterTabs
                            options={ACTIVE_OPTIONS}
                            value={list.filters.isActive}
                            onChange={(v) => list.setFilter('isActive', v)}
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
            />
        </DashboardShell>
    );
}
