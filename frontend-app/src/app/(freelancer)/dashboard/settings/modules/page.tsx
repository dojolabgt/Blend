'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ModuleCard, WorkspacePlan } from './_components/ModuleCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Puzzle, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ─── Module definitions ───────────────────────────────────────────────────────

const MODULES = [
    {
        id: 'audiovisual',
        icon: '🎬',
        name: 'Producción Audiovisual',
        tagline: 'Pre, producción y post en un flujo',
        description: 'Flujos y campos especializados para productoras de video, cine y contenido. Gestiona etapas, crews y tiempos de edición.',
        features: [
            'Fases de proyecto: Pre / Producción / Post',
            'Campos de crew y roles técnicos',
            'Estimados de horas por etapa',
            'Seguimiento de entregables y versiones',
        ],
        category: 'Audiovisual',
        requiredPlan: 'pro' as const,
    },
    {
        id: 'photography',
        icon: '📸',
        name: 'Fotografía',
        tagline: 'Desde el brief hasta la galería final',
        description: 'Organiza sesiones fotográficas, selecciones, edición y entrega. Incluye campos de shooting para bodas, eventos y retratos.',
        features: [
            'Tipos de sesión: Boda / Evento / Retrato / Estudio',
            'Flujo de selección y culling',
            'Entrega de galerías con contador de fotos',
            'Campos de locación y permisos',
        ],
        category: 'Fotografía',
        requiredPlan: 'pro' as const,
    },
    {
        id: 'webdev',
        icon: '💻',
        name: 'Desarrollo Web',
        tagline: 'De requerimientos a deploy',
        description: 'Agrega campos técnicos a tus proyectos: repos, issues, sprints, tecnología y ambientes. Ideal para agencias y freelancers dev.',
        features: [
            'Campos de stack tecnológico',
            'Links de repositorio y ambiente (dev/staging/prod)',
            'Tracker de issues y bugs por proyecto',
            'Estimación por sprints o hitos',
        ],
        category: 'Desarrollo',
        requiredPlan: 'pro' as const,
    },
    {
        id: 'design',
        icon: '🎨',
        name: 'Diseño & UX/UI',
        tagline: 'Del concepto al handoff',
        description: 'Flujos para diseñadores gráficos, de producto y UX. Incluye etapas de research, wireframes, diseño visual y entrega de assets.',
        features: [
            'Etapas: Discovery / Wireframe / UI / Handoff',
            'Links de Figma, prototipos y presentaciones',
            'Revisiones y rondas de feedback',
            'Categorías de entregables por tipo de diseño',
        ],
        category: 'Diseño',
        requiredPlan: 'pro' as const,
    },
    {
        id: 'marketing',
        icon: '📣',
        name: 'Marketing & Contenido',
        tagline: 'Campañas, canales y resultados',
        description: 'Gestiona campañas de marketing digital, producción de contenido y reportes. Conecta canales, audiencias y KPIs a cada proyecto.',
        features: [
            'Campos de canal: Meta / Google / TikTok / Email',
            'Briefing de campaña y audiencia objetivo',
            'Seguimiento de entregables de contenido',
            'Reportes de performance por campaña',
        ],
        category: 'Marketing',
        requiredPlan: 'premium' as const,
    },
    {
        id: 'consulting',
        icon: '📊',
        name: 'Consultoría',
        tagline: 'Diagnóstico, propuesta y ejecución',
        description: 'Estructura presentaciones, informes y entregables de consultoría. Agrega campos de diagnóstico, hallazgos y plan de acción.',
        features: [
            'Etapas: Diagnóstico / Propuesta / Implementación',
            'Entregables: Informe / Presentación / Plan',
            'Registro de sesiones y notas de cliente',
            'Seguimiento de acuerdos y acciones',
        ],
        category: 'Consultoría',
        requiredPlan: 'premium' as const,
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ModulesPage() {
    const { activeWorkspace } = useAuth();
    const userPlan = (activeWorkspace?.plan ?? 'free') as WorkspacePlan;

    // In the future this will come from workspace settings
    const [activeModuleIds, setActiveModuleIds] = useState<string[]>([]);

    const activeCount = activeModuleIds.length;

    const toggleModule = (id: string) => {
        setActiveModuleIds(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    // Plan descriptions
    const planInfo: Record<WorkspacePlan, { label: string; limit: string; color: string }> = {
        free: { label: 'Free', limit: 'Sin módulos activos', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
        pro: { label: 'Pro', limit: '1 módulo activo', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        premium: { label: 'Premium', limit: 'Todos los módulos', color: 'bg-violet-100 text-violet-700 border-violet-200' },
    };
    const { label, limit, color } = planInfo[userPlan];

    return (
        <DashboardShell>
            <div className="space-y-8 w-full py-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                            <Puzzle className="w-5 h-5 text-primary" />
                            Módulos
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Adapta Blend a tu industria. Cada módulo añade campos, etapas y flujos especializados a tus proyectos.
                        </p>
                    </div>

                    {/* Plan badge + usage */}
                    <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
                        <Crown className="w-3 h-3" />
                        {label} — {limit}
                    </div>
                </div>

                {/* Pro limit notice */}
                {userPlan === 'pro' && activeCount >= 1 && (
                    <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <Crown className="w-4 h-4 shrink-0" />
                        Tienes 1 módulo activo. Actualiza a <strong>Premium</strong> para activar más módulos.
                    </div>
                )}

                {/* Pro modules */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                        Módulos Pro
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MODULES.filter(m => m.requiredPlan === 'pro').map(module => (
                            <ModuleCard
                                key={module.id}
                                {...module}
                                isActive={activeModuleIds.includes(module.id)}
                                activeModulesCount={activeCount}
                                userPlan={userPlan}
                                onActivate={() => toggleModule(module.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Premium modules */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-400 block" />
                        Módulos Premium
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MODULES.filter(m => m.requiredPlan === 'premium').map(module => (
                            <ModuleCard
                                key={module.id}
                                {...module}
                                isActive={activeModuleIds.includes(module.id)}
                                activeModulesCount={activeCount}
                                userPlan={userPlan}
                                onActivate={() => toggleModule(module.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
