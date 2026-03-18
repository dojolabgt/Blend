/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useBriefTemplates } from '@/hooks/use-brief-templates';
import { Button } from '@/components/ui/button';
import {
    FileText,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Pencil,
    AlignLeft,
    AlignJustify,
    ChevronDown,
    Circle,
    CheckSquare,
    Star,
    Info,
    AlertCircle,
} from 'lucide-react';
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
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';


interface BriefStepProps {
    initialSelectedTemplateId?: string | null;
    publicToken?: string | null;
    isCompleted?: boolean;
    responses?: Record<string, any>;
    onSelectTemplate?: (id: string | null) => void;
    workspaceId?: string;
    readonly?: boolean;
}

// ── Field type helpers ─────────────────────────────────────────────────────

type FieldTypeConfig = { label: string; icon: React.ReactNode; color: string; mockPreview: React.ReactNode };

function FieldMockPreview({ field, config, otherLabel, t }: { field: Record<string, any>; config: FieldTypeConfig | undefined; otherLabel: string; t: (key: string) => string }) {
    if (!config) return null;

    if (['radio', 'checkbox'].includes(field.type) && field.options?.length > 0) {
        return (
            <div className="mt-2 space-y-1.5">
                {field.options.slice(0, 3).map((opt: string | { label: string }, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className={`w-3.5 h-3.5 flex-shrink-0 border border-zinc-300 dark:border-zinc-600 ${field.type === 'radio' ? 'rounded-full' : 'rounded'} bg-zinc-50 dark:bg-zinc-900`} />
                        <span>{typeof opt === 'string' ? opt : opt.label}</span>
                    </div>
                ))}
                {field.options.length > 3 && (
                    <p className="text-[10px] text-zinc-400 pl-5">+{field.options.length - 3} {t('brief.moreOptions')}</p>
                )}
                {field.allowOther && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 italic">
                        <div className={`w-3.5 h-3.5 flex-shrink-0 border border-dashed border-zinc-300 dark:border-zinc-600 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`} />
                        <span>{otherLabel}</span>
                    </div>
                )}
            </div>
        );
    }

    return config.mockPreview;
}

export function BriefStep({
    initialSelectedTemplateId,
    publicToken,
    isCompleted,
    responses = {},
    onSelectTemplate,
    workspaceId,
    readonly,
}: BriefStepProps) {
    const router = useRouter();
    const { t } = useWorkspaceSettings();
    const { templates, fetchTemplates, isLoading } = useBriefTemplates(workspaceId);

    const FIELD_TYPE_CONFIG: Record<string, FieldTypeConfig> = {
        text: {
            label: t('brief.fieldTypeShort'),
            icon: <AlignLeft className="w-3.5 h-3.5" />,
            color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            mockPreview: (
                <div className="mt-2 h-9 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex items-center px-3 text-xs text-zinc-400 dark:text-zinc-500 italic">
                    {t('brief.shortAnswerPlaceholder')}
                </div>
            ),
        },
        textarea: {
            label: t('brief.fieldTypeParagraph'),
            icon: <AlignJustify className="w-3.5 h-3.5" />,
            color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            mockPreview: (
                <div className="mt-2 h-20 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex items-start px-3 pt-2 text-xs text-zinc-400 dark:text-zinc-500 italic">
                    {t('brief.paragraphPlaceholder')}
                </div>
            ),
        },
        select: {
            label: t('brief.fieldTypeSelect'),
            icon: <ChevronDown className="w-3.5 h-3.5" />,
            color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            mockPreview: (
                <div className="mt-2 h-9 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex items-center px-3 text-xs text-zinc-400 dark:text-zinc-500 italic justify-between">
                    {t('brief.selectPlaceholder')}
                    <ChevronDown className="w-3.5 h-3.5" />
                </div>
            ),
        },
        radio: {
            label: t('brief.fieldTypeRadio'),
            icon: <Circle className="w-3.5 h-3.5" />,
            color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            mockPreview: null,
        },
        checkbox: {
            label: t('brief.fieldTypeCheckbox'),
            icon: <CheckSquare className="w-3.5 h-3.5" />,
            color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
            mockPreview: null,
        },
        rating: {
            label: t('brief.fieldTypeRating'),
            icon: <Star className="w-3.5 h-3.5" />,
            color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
            mockPreview: (
                <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                    ))}
                </div>
            ),
        },
    };
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialSelectedTemplateId || null);
    // Fix 1.4 — gate for the "Cambiar" destructive confirmation
    const [showChangeBriefDialog, setShowChangeBriefDialog] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleSelect = (tpl: { id: string; isActive?: boolean }) => {
        if (readonly) return;
        if (!tpl.isActive) return;
        setSelectedTemplate(tpl.id);
        if (onSelectTemplate) onSelectTemplate(tpl.id);
        toast.success(t('brief.toastSelected'));
    };

    // Fix 1.4 — only show dialog when a brief is already linked or already completed
    const handleBack = () => {
        if (selectedTemplate) {
            setShowChangeBriefDialog(true);
        } else {
            setSelectedTemplate(null);
            if (onSelectTemplate) onSelectTemplate(null);
        }
    };

    const confirmChangeBrief = () => {
        setSelectedTemplate(null);
        if (onSelectTemplate) onSelectTemplate(null);
        setShowChangeBriefDialog(false);
    };

    // ── Template list view ────────────────────────────────────────────────

    if (!selectedTemplate) {
        const columns: ColumnDef<{ id: string; name: string; description?: string; isActive?: boolean; schema?: any[] }>[] = [
            {
                key: 'name',
                header: t('brief.templateNameHeader'),
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
                header: t('brief.questionsHeader'),
                render: (tpl) => (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                        {tpl.schema?.length || 0} {t('brief.fieldsCount')}
                    </span>
                ),
            },
            {
                key: 'status',
                header: t('briefTemplates.colStatus'),
                render: (tpl) =>
                    tpl.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {t('brief.statusActive')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <XCircle className="w-3.5 h-3.5" /> {t('brief.statusInactive')}
                        </span>
                    ),
            },
            {
                key: 'action',
                header: '',
                className: 'text-right',
                render: (tpl) => (
                    <Button
                        size="sm"
                        variant={tpl.isActive ? 'outline' : 'ghost'}
                        disabled={!tpl.isActive}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(tpl);
                        }}
                        className="text-xs"
                    >
                        {t('brief.useBtn')} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                ),
            },
        ];

        return (
            <div className="space-y-6">
                {/* Sub-header */}
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{t('brief.selectBriefTitle')}</h3>
                        <p className="text-sm text-zinc-500 mt-0.5 max-w-lg">
                            {t('brief.selectBriefDesc')}
                        </p>
                    </div>
                </div>

                {/* Template table — Fix 1.5: clicking any row selects the template */}
                <DataTable
                    data={templates}
                    columns={columns}
                    isLoading={isLoading}
                    emptyIcon={<FileText className="w-8 h-8" />}
                    emptyTitle={t('brief.emptyTitle')}
                    emptyDescription={t('brief.emptyDesc')}
                    onRowClick={(tpl) => handleSelect(tpl)}
                />
            </div>
        );
    }

    // ── Template preview view (Redesigned — Document style) ────────────────

    const tpl = templates.find(t => t.id === selectedTemplate);
    const schema: Record<string, any>[] = tpl?.schema || [];

    return (
        <div className="space-y-6">
            {/* Header Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">{t('brief.selectedLabel')}</p>
                        <h3 className="font-semibold text-zinc-900 dark:text-white truncate text-sm mt-0.5">
                            {tpl?.name || 'Plantilla'}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {/* Fix 1.4 — AlertDialog confirmation */}
                    {!readonly && (
                        <>
                            <AlertDialog open={showChangeBriefDialog} onOpenChange={setShowChangeBriefDialog}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('brief.changeBriefTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {isCompleted
                                                ? t('brief.changeBriefDescCompleted')
                                                : t('brief.changeBriefDescPending')}
                                            {' '}{t('brief.continueConfirm')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={confirmChangeBrief}>
                                            {t('brief.changeBriefConfirm')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-zinc-500"
                                onClick={handleBack}
                            >
                                {t('brief.changeBtn')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1.5"
                                onClick={() => router.push(`/dashboard/templates/briefs?edit=${selectedTemplate}`)}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                {t('brief.editTemplateBtn')}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* UX Warning para cambios externos */}
            {!isCompleted && !readonly && (
                <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{t('brief.changeWarning')}</p>
                </div>
            )}

            {/* Fields — Document style */}
            {schema.length === 0 ? (
                <div className="h-48 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 gap-2">
                    <AlertCircle className="w-8 h-8 opacity-40" />
                    <p className="text-sm">{t('brief.noQuestionsYet')}</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs mt-1"
                        onClick={() => router.push(`/dashboard/templates/briefs?edit=${selectedTemplate}`)}
                    >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> {t('brief.goEditBtn')}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {schema.map((field, idx) => {
                        const config = FIELD_TYPE_CONFIG[field.type] || FIELD_TYPE_CONFIG['text'];
                        return (
                            <div
                                key={field.id}
                                className="group bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 transition-shadow hover:shadow-sm"
                            >
                                {/* Question header */}
                                <div className="flex items-start justify-between gap-3 mb-1">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Number badge */}
                                        <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-zinc-900 dark:text-white text-sm leading-snug">
                                                {field.label || t('brief.noQuestionLabel')}
                                                {field.required && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </p>
                                            {field.description && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                    {field.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Field type badge */}
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${config.color}`}>
                                        {config.icon}
                                        {config.label}
                                    </span>
                                </div>

                                {/* Tooltip */}
                                {field.tooltip && (
                                    <div className="flex items-center gap-1.5 ml-9 mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                                        <Info className="w-3 h-3 flex-shrink-0" />
                                        <span>{field.tooltip}</span>
                                    </div>
                                )}

                                {/* Answer / Mock preview */}
                                <div className="ml-9 mt-2">
                                    {isCompleted ? (
                                        <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100">
                                            {responses[field.id] !== undefined && responses[field.id] !== '' ? (
                                                Array.isArray(responses[field.id]) ? (
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {(responses[field.id] as string[]).map((ans: string, i: number) => <li key={i}>{ans}</li>)}
                                                    </ul>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{String(responses[field.id])}</p>
                                                )
                                            ) : (
                                                <span className="text-zinc-400 italic">{t('brief.noAnswer')}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <FieldMockPreview field={field} config={FIELD_TYPE_CONFIG[field.type]} otherLabel={t('brief.otherOption')} t={t} />
                                    )}
                                </div>

                                {/* Conditional logic hint */}
                                {field.dependsOn?.fieldId && (
                                    <div className="ml-9 mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-full">
                                        <AlertCircle className="w-3 h-3" />
                                        {t('brief.conditionalVisible')}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Summary footer */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 px-1 pt-1">
                        <span>{schema.length} {schema.length !== 1 ? t('brief.totalQuestionPlural') : t('brief.totalQuestionSingular')}</span>
                        <span>{schema.filter(f => f.required).length} {schema.filter(f => f.required).length !== 1 ? t('brief.requiredPlural') : t('brief.requiredSingular')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
