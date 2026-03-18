'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { projectsApi } from '@/features/projects/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { useListState } from '@/hooks/use-list-state';
import { AppSearch } from '@/components/common/AppSearch';
import { AppFilterTabs, FilterOption } from '@/components/common/AppFilterTabs';
import { AppPagination } from '@/components/common/AppPagination';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ProjectStatus = 'ACTIVE' | 'COMPLETED';

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
    COMPLETED: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
    const key = status?.toUpperCase() ?? 'ACTIVE';
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[key] ?? STATUS_STYLES.ACTIVE}`}>
            {label}
        </span>
    );
}

interface ProjectItem {
    id: string;
    name: string;
    status: string;
    workspace?: { id: string; name?: string; businessName?: string };
    deal?: { client?: { name?: string } };
    collaborators?: unknown[];
    createdAt: string;
    [key: string]: unknown;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
    const { activeWorkspace } = useAuth();
    const { t } = useWorkspaceSettings();
    const router = useRouter();

    const STATUS_LABEL: Record<string, string> = {
        ACTIVE: t('projects.statusActive'),
        COMPLETED: t('projects.statusCompleted'),
    };

    const STATUS_OPTIONS: FilterOption<ProjectStatus>[] = [
        { label: t('projects.filterAll'), value: undefined },
        { label: t('projects.filterActive'), value: 'ACTIVE' },
        { label: t('projects.filterCompleted'), value: 'COMPLETED' },
    ];

    const list = useListState<{ status: ProjectStatus | undefined }>({
        initialFilters: { status: undefined },
    });

    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);

    const loadProjects = useCallback(async () => {
        if (!activeWorkspace?.id) return;
        setIsLoading(true);
        try {
            const res = await projectsApi.getAll(activeWorkspace.id, list.query);
            setProjects(res.data as ProjectItem[]);
            setMeta({ total: res.total, totalPages: res.totalPages });
        } catch (error) {
            console.error('Error loading projects', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace?.id, list.query]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const getClientName = (project: ProjectItem) => project.deal?.client?.name ?? '—';

    const columns: ColumnDef<ProjectItem>[] = [
        {
            key: 'name',
            header: t('projects.colProject'),
            render: (project) => {
                const isShared = project.workspace?.id !== activeWorkspace?.id;
                return (
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="font-semibold group-hover:text-primary transition-colors">
                                {project.name || t('projects.unknown')}
                            </div>
                            {isShared && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    {t('projects.sharedFrom')} {project.workspace?.businessName || project.workspace?.name || '—'}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">{getClientName(project)}</div>
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: t('projects.colStatus'),
            render: (project) => (
                <StatusBadge
                    status={project.status ?? 'ACTIVE'}
                    label={STATUS_LABEL[(project.status ?? 'ACTIVE').toUpperCase()] ?? project.status}
                />
            ),
        },
        {
            key: 'collaborators',
            header: t('projects.colCollaborators'),
            render: (project) => (
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {project.collaborators?.length || 0}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: t('projects.colDate'),
            render: (project) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString('es-GT')}
                </span>
            ),
        },
    ];

    return (
        <DashboardShell>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('projects.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('projects.titleDesc')}
                    </p>
                </div>
            </div>

            <DataTable
                data={projects}
                columns={columns}
                isLoading={isLoading}
                emptyIcon={<FolderKanban className="w-8 h-8" />}
                emptyTitle={t('projects.emptyTitle')}
                emptyDescription={t('projects.emptyDesc')}
                toolbar={
                    <>
                        <AppSearch
                            value={list.search}
                            onChange={list.setSearch}
                            placeholder={t('projects.searchPlaceholder')}
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
                onRowClick={(project) => router.push(`/dashboard/projects/${project.id}`)}
            />
        </DashboardShell>
    );
}
