'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useProjects } from '@/hooks/use-projects';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, CreditCard, LayoutTemplate, FileText, CheckSquare, Folder } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ProjectData {
    id: string;
    name: string;
    status: string;
    workspaceId: string;
    workspace?: { id: string; name?: string; businessName?: string };
    deal?: {
        id?: string;
        publicToken?: string;
        proposalIntro?: string;
        currency?: { code?: string; symbol?: string; name?: string };
        client?: { name: string; email?: string; whatsapp?: string };
        quotations?: {
            isApproved?: boolean;
            optionName?: string;
            description?: string;
            currency?: string;
            total?: number;
            items?: { name: string; quantity: string | number; price: string | number }[];
        }[];
        brief?: {
            template?: { name: string; schema: { id: string; label: string }[] };
            responses?: Record<string, string | string[]>;
        };
    };
    collaborators?: { id: string; workspace: { id: string; businessName?: string; logo?: string; name?: string }; role: string }[];
    [key: string]: unknown;
}

interface ProjectContextType {
    project: ProjectData;
    isOwner: boolean;
    isViewer: boolean;
    refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a Project Layout');
    }
    return context;
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const projectId = params.id as string;

    const { activeWorkspace } = useAuth();
    const { fetchProject, isLoading } = useProjects();
    const [project, setProject] = useState<ProjectData | null>(null);

    const loadProject = async () => {
        if (!activeWorkspace || !projectId) return;
        const data = await fetchProject(projectId);
        if (data) setProject(data);
    };

    useEffect(() => {
        loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace, projectId]);

    if (isLoading || !project) {
        return (
            <DashboardShell>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <div className="w-8 h-8 border-2 border-zinc-300 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm">Cargando proyecto...</span>
                    </div>
                </div>
            </DashboardShell>
        );
    }

    const { deal } = project;
    const clientName = deal?.client?.name || 'Cliente sin nombre';

    const isOwner = project.workspaceId === activeWorkspace?.id;
    const collabMatch = project.collaborators?.find((c) => c.workspace.id === activeWorkspace?.id);
    const isViewer = !isOwner && collabMatch?.role === 'viewer';
    const isCompleted = project.status === 'COMPLETED';

    const tabs = [
        { name: 'Resumen',         href: `/dashboard/projects/${projectId}`,           icon: Folder },
        { name: 'Tareas',          href: `/dashboard/projects/${projectId}/tasks`,      icon: CheckSquare },
        { name: 'Brief',           href: `/dashboard/projects/${projectId}/brief`,      icon: FileText },
        { name: 'Documentos',      href: `/dashboard/projects/${projectId}/assets`,     icon: LayoutTemplate },
        { name: 'Pagos',           href: `/dashboard/projects/${projectId}/payments`,   icon: CreditCard },
        { name: 'Colaboradores',   href: `/dashboard/projects/${projectId}/team`,       icon: Users },
    ];

    return (
        <ProjectContext.Provider value={{ project, isOwner, isViewer, refreshProject: loadProject }}>
            <DashboardShell>
                {/* Back */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-5 -ml-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    onClick={() => router.push('/dashboard/projects')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Proyectos
                </Button>

                {/* Hero header */}
                <div className={cn(
                    'rounded-2xl border p-6 mb-6 transition-colors',
                    isCompleted
                        ? 'bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800'
                        : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50',
                )}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                                isCompleted
                                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                                    : 'bg-emerald-200 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-400',
                            )}>
                                <Folder className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                                        {project.name}
                                    </h1>
                                    <span className={cn(
                                        'px-2 py-0.5 rounded-md text-xs font-semibold',
                                        isCompleted
                                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                            : 'bg-emerald-200 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-300',
                                    )}>
                                        {isCompleted ? 'Completado' : 'Activo'}
                                    </span>
                                    {!isOwner && (
                                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            Colaborador
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Cliente: <span className="font-medium text-zinc-700 dark:text-zinc-300">{clientName}</span>
                                </p>
                            </div>
                        </div>

                        {deal?.quotations?.[0]?.total && (
                            <div className="text-right shrink-0">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Valor</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {deal.currency?.symbol || '$'}{Number(deal.quotations.find(q => q.isApproved)?.total ?? deal.quotations[0]?.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-zinc-400">{deal.quotations.find(q => q.isApproved)?.currency ?? deal.quotations[0]?.currency}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-0.5 mb-6 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                                    isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700',
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>

                {children}
            </DashboardShell>
        </ProjectContext.Provider>
    );
}
