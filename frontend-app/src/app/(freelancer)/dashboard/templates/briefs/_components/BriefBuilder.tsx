'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    Type, AlignLeft, ChevronDown, Circle, CheckSquare,
    Plus, Trash2, GripVertical, Save, Settings2,
} from 'lucide-react';
import { useBriefTemplates, BriefTemplate } from '@/hooks/use-brief-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldOption {
    label: string;
    value: string;
}

interface Field {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
    label: string;
    placeholder: string;
    description: string;
    tooltip: string;
    required: boolean;
    allowOther: boolean;
    options: FieldOption[];
    dependsOn?: { fieldId: string; value: string };
    [key: string]: any;
}

type Tab = 'content' | 'config' | 'logic';

const FIELD_TYPES: { value: Field['type']; label: string; icon: React.ReactNode }[] = [
    { value: 'text', label: 'Texto corto', icon: <Type className="w-4 h-4" /> },
    { value: 'textarea', label: 'Párrafo', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'select', label: 'Lista', icon: <ChevronDown className="w-4 h-4" /> },
    { value: 'radio', label: 'Opción única', icon: <Circle className="w-4 h-4" /> },
    { value: 'checkbox', label: 'Múltiple', icon: <CheckSquare className="w-4 h-4" /> },
];

function makeField(): Field {
    return {
        id: crypto.randomUUID(),
        type: 'text',
        label: 'Nueva pregunta',
        placeholder: '',
        description: '',
        tooltip: '',
        required: true,
        allowOther: false,
        options: [],
    };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BriefBuilderProps {
    template: BriefTemplate;
    onClose: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BriefBuilder({ template: initialTemplate }: BriefBuilderProps) {
    const { updateTemplate } = useBriefTemplates();

    const [name, setName] = useState(initialTemplate.name);
    const [fields, setFields] = useState<Field[]>(
        (initialTemplate.schema ?? []).map((f) => ({
            id: f.id ?? crypto.randomUUID(),
            type: (f.type as Field['type']) ?? 'text',
            label: f.label ?? '',
            placeholder: (f.placeholder as string) ?? '',
            description: (f.description as string) ?? '',
            tooltip: (f.tooltip as string) ?? '',
            required: f.required ?? true,
            allowOther: (f.allowOther as boolean) ?? false,
            options: (f.options as any[])?.map((opt: any) => typeof opt === 'string' ? { label: opt, value: opt } : opt as FieldOption) ?? [],
            dependsOn: f.dependsOn as Field['dependsOn'],
        }))
    );
    const [selectedId, setSelectedId] = useState<string | null>(fields[0]?.id ?? null);
    const [tab, setTab] = useState<Tab>('content');
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // DnD
    const dragFromIdx = useRef<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const mutate = useCallback((updater: (prev: Field[]) => Field[]) => {
        setFields(updater);
        setIsDirty(true);
    }, []);

    const updateField = useCallback((id: string, patch: Partial<Field>) => {
        mutate((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    }, [mutate]);

    const addField = () => {
        const f = makeField();
        mutate((prev) => [...prev, f]);
        setSelectedId(f.id);
        setTab('content');
    };

    const removeField = (id: string) => {
        mutate((prev) => {
            const next = prev.filter((f) => f.id !== id);
            if (selectedId === id) {
                setSelectedId(next[0]?.id ?? null);
            }
            return next;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await updateTemplate(initialTemplate.id, {
                name,
                schema: fields,
                isActive: initialTemplate.isActive,
            });
            if (updated) {
                toast.success('Plantilla guardada');
                setIsDirty(false);
            } else {
                toast.error('Error al guardar');
            }
        } catch {
            toast.error('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    // ─── DnD handlers ─────────────────────────────────────────────────────────

    const onDragStart = (idx: number) => { dragFromIdx.current = idx; };
    const onDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        setDragOverIdx(idx);
    };
    const onDrop = (toIdx: number) => {
        const fromIdx = dragFromIdx.current;
        if (fromIdx === null || fromIdx === toIdx) { setDragOverIdx(null); return; }
        mutate((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
        });
        dragFromIdx.current = null;
        setDragOverIdx(null);
    };
    const onDragEnd = () => { dragFromIdx.current = null; setDragOverIdx(null); };

    // ─── Derived ──────────────────────────────────────────────────────────────

    const selectedField = fields.find((f) => f.id === selectedId) ?? null;
    const selectedIdx = fields.findIndex((f) => f.id === selectedId);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 shrink-0">
                <Input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                    className="font-semibold text-base border-transparent hover:border-zinc-200 focus-visible:ring-1 bg-transparent h-9 flex-1 max-w-xs"
                />
                <div className="ml-auto flex items-center gap-2">
                    {isDirty && <span className="text-xs text-amber-500 font-medium hidden sm:block">Sin guardar</span>}
                    <Button size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
                        <Save className="w-4 h-4 mr-1.5" />
                        {isSaving ? 'Guardando…' : 'Guardar'}
                    </Button>
                </div>
            </div>

            {/* ── Body: Sidebar + Canvas ──────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* Sidebar */}
                <div className="w-56 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/30">
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {fields.length === 0 && (
                            <p className="text-xs text-zinc-400 text-center py-8 px-2">
                                Añade tu primer campo →
                            </p>
                        )}
                        {fields.map((field, idx) => {
                            const typeInfo = FIELD_TYPES.find((t) => t.value === field.type);
                            const isSelected = field.id === selectedId;
                            const isDragOver = dragOverIdx === idx;
                            return (
                                <div
                                    key={field.id}
                                    draggable
                                    onDragStart={() => onDragStart(idx)}
                                    onDragOver={(e) => onDragOver(e, idx)}
                                    onDrop={() => onDrop(idx)}
                                    onDragEnd={onDragEnd}
                                    onClick={() => { setSelectedId(field.id); setTab('content'); }}
                                    className={cn(
                                        'group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-all select-none',
                                        isSelected
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400',
                                        isDragOver && 'border-t-2 border-primary',
                                    )}
                                >
                                    <GripVertical className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                                    <span className={cn('shrink-0', isSelected ? 'text-primary' : 'text-zinc-400')}>
                                        {typeInfo?.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate leading-tight">
                                            {field.label || 'Sin título'}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 truncate">{typeInfo?.label}</p>
                                    </div>
                                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600 shrink-0">{idx + 1}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed text-xs gap-1.5"
                            onClick={addField}
                        >
                            <Plus className="w-3.5 h-3.5" /> Agregar campo
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {!selectedField ? (
                        <EmptyCanvas onAdd={addField} />
                    ) : (
                        <>
                            {/* Live preview */}
                            <div className="relative p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                                <span className="absolute top-3 right-3 text-[10px] font-medium tracking-wide uppercase text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full select-none">
                                    Vista previa
                                </span>
                                <div className="pointer-events-none select-none">
                                    <FieldPreview field={selectedField} />
                                </div>
                            </div>

                            {/* Settings panel */}
                            <div className="flex-1 overflow-y-auto">
                                {/* Tabs */}
                                <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-4 bg-zinc-50/50 dark:bg-zinc-950/20 shrink-0">
                                    {(['content', 'config', 'logic'] as Tab[]).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTab(t)}
                                            className={cn(
                                                'px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px',
                                                tab === t
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200',
                                            )}
                                        >
                                            {t === 'content' ? 'Contenido' : t === 'config' ? 'Configuración' : 'Lógica'}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => removeField(selectedField.id)}
                                        className="ml-auto p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        title="Eliminar campo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Tab panels */}
                                <div className="p-5 space-y-5">
                                    {tab === 'content' && (
                                        <ContentTab
                                            field={selectedField}
                                            onChange={(patch) => updateField(selectedField.id, patch)}
                                        />
                                    )}
                                    {tab === 'config' && (
                                        <ConfigTab
                                            field={selectedField}
                                            onChange={(patch) => updateField(selectedField.id, patch)}
                                        />
                                    )}
                                    {tab === 'logic' && (
                                        <LogicTab
                                            field={selectedField}
                                            fieldIdx={selectedIdx}
                                            allFields={fields}
                                            onChange={(patch) => updateField(selectedField.id, patch)}
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Empty canvas ─────────────────────────────────────────────────────────────

function EmptyCanvas({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <Settings2 className="w-12 h-12 text-zinc-200 dark:text-zinc-700" />
            <div>
                <h3 className="font-medium text-zinc-800 dark:text-zinc-200">Sin campos aún</h3>
                <p className="text-sm text-zinc-400 mt-1">Agrega un campo para empezar a construir tu formulario</p>
            </div>
            <Button variant="outline" onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" /> Agregar primer campo
            </Button>
        </div>
    );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

function FieldPreview({ field }: { field: Field }) {
    return (
        <div className="max-w-lg space-y-1.5">
            <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {field.label || <span className="italic text-zinc-400">Sin título</span>}
                </span>
                {field.required && <span className="text-red-500 text-xs">*</span>}
            </div>
            {field.description && (
                <p className="text-xs text-zinc-500">{field.description}</p>
            )}
            {field.type === 'text' && (
                <input
                    readOnly
                    placeholder={field.placeholder || 'Escribe aquí…'}
                    className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 text-sm text-zinc-400 cursor-default"
                />
            )}
            {field.type === 'textarea' && (
                <textarea
                    readOnly
                    rows={3}
                    placeholder={field.placeholder || 'Escribe aquí…'}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400 cursor-default resize-none"
                />
            )}
            {field.type === 'select' && (
                <div className="relative w-full">
                    <select
                        disabled
                        className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 text-sm text-zinc-400 cursor-default appearance-none"
                    >
                        <option>{field.placeholder || 'Selecciona una opción…'}</option>
                        {field.options.map((o, i) => <option key={i}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
            )}
            {field.type === 'radio' && (
                <div className="space-y-1.5">
                    {field.options.length === 0 && (
                        <p className="text-xs text-zinc-400 italic">Añade opciones en la pestaña Contenido</p>
                    )}
                    {field.options.map((o, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-zinc-500 cursor-default">
                            <span className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600 shrink-0 inline-block" />
                            {o.label}
                        </label>
                    ))}
                    {field.allowOther && (
                        <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-default">
                            <span className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600 shrink-0 inline-block" />
                            Otro
                        </label>
                    )}
                </div>
            )}
            {field.type === 'checkbox' && (
                <div className="space-y-1.5">
                    {field.options.length === 0 && (
                        <p className="text-xs text-zinc-400 italic">Añade opciones en la pestaña Contenido</p>
                    )}
                    {field.options.map((o, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-zinc-500 cursor-default">
                            <span className="w-4 h-4 rounded-md border-2 border-zinc-300 dark:border-zinc-600 shrink-0 inline-block" />
                            {o.label}
                        </label>
                    ))}
                    {field.allowOther && (
                        <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-default">
                            <span className="w-4 h-4 rounded-md border-2 border-zinc-300 dark:border-zinc-600 shrink-0 inline-block" />
                            Otro
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Content Tab ──────────────────────────────────────────────────────────────

function ContentTab({ field, onChange }: { field: Field; onChange: (p: Partial<Field>) => void }) {
    return (
        <div className="space-y-5">
            {/* Label */}
            <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Pregunta</Label>
                <Input
                    value={field.label}
                    onChange={(e) => onChange({ label: e.target.value })}
                    placeholder="Ej. ¿Cuál es tu objetivo principal?"
                    className="text-sm"
                />
            </div>

            {/* Field type */}
            <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Tipo de campo</Label>
                <div className="grid grid-cols-5 gap-1.5">
                    {FIELD_TYPES.map((ft) => (
                        <button
                            key={ft.value}
                            onClick={() => onChange({
                                type: ft.value,
                                options: ['select', 'radio', 'checkbox'].includes(ft.value) ? field.options : [],
                            })}
                            title={ft.label}
                            className={cn(
                                'flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-all',
                                field.type === ft.value
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500',
                            )}
                        >
                            {ft.icon}
                            <span className="text-[9px] font-medium leading-tight">{ft.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Options (choice types) */}
            {['select', 'radio', 'checkbox'].includes(field.type) && (
                <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Opciones</Label>
                    <div className="space-y-2">
                        {field.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                                <Input
                                    value={opt.label}
                                    onChange={(e) => {
                                        const newOpts = [...field.options];
                                        newOpts[optIdx] = { label: e.target.value, value: e.target.value };
                                        onChange({ options: newOpts });
                                    }}
                                    placeholder={`Opción ${optIdx + 1}`}
                                    className="h-8 text-sm"
                                />
                                <button
                                    onClick={() => onChange({ options: field.options.filter((_, i) => i !== optIdx) })}
                                    className="shrink-0 p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed text-xs h-8"
                            onClick={() => onChange({ options: [...field.options, { label: '', value: '' }] })}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Añadir opción
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Config Tab ───────────────────────────────────────────────────────────────

function ConfigTab({ field, onChange }: { field: Field; onChange: (p: Partial<Field>) => void }) {
    return (
        <div className="space-y-5">
            <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Placeholder</Label>
                <Input
                    value={field.placeholder}
                    onChange={(e) => onChange({ placeholder: e.target.value })}
                    placeholder="Texto de ayuda dentro del campo…"
                    className="text-sm"
                />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Descripción</Label>
                <Input
                    value={field.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Aparece debajo del título de la pregunta"
                    className="text-sm"
                />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Tooltip</Label>
                <Input
                    value={field.tooltip}
                    onChange={(e) => onChange({ tooltip: e.target.value })}
                    placeholder="Aparece al pasar el cursor (ℹ)"
                    className="text-sm"
                />
            </div>
            <div className="flex items-center justify-between py-1">
                <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Obligatorio</p>
                    <p className="text-xs text-zinc-400">El cliente debe responder esta pregunta</p>
                </div>
                <Switch
                    checked={field.required}
                    onCheckedChange={(v) => onChange({ required: v })}
                />
            </div>
            {['select', 'radio', 'checkbox'].includes(field.type) && (
                <div className="flex items-center justify-between py-1">
                    <div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Permitir "Otro"</p>
                        <p className="text-xs text-zinc-400">Añade una opción de texto libre</p>
                    </div>
                    <Switch
                        checked={field.allowOther}
                        onCheckedChange={(v) => onChange({ allowOther: v })}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Logic Tab ────────────────────────────────────────────────────────────────

function LogicTab({
    field, fieldIdx, allFields, onChange,
}: {
    field: Field;
    fieldIdx: number;
    allFields: Field[];
    onChange: (p: Partial<Field>) => void;
}) {
    const eligibleParents = allFields
        .slice(0, fieldIdx)
        .filter((f) => ['select', 'radio', 'checkbox'].includes(f.type));

    const parentField = allFields.find((f) => f.id === field.dependsOn?.fieldId);

    if (fieldIdx === 0 || eligibleParents.length === 0) {
        return (
            <p className="text-sm text-zinc-400">
                La lógica condicional requiere al menos una pregunta de opción única, múltiple o lista antes de este campo.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-xs text-zinc-500">Mostrar este campo solo cuando…</p>

            <div className="space-y-3">
                <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-500">Pregunta condicional</Label>
                    <select
                        className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={field.dependsOn?.fieldId ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                                const { dependsOn: _d, ...rest } = field;
                                onChange(rest as Partial<Field>);
                            } else {
                                onChange({ dependsOn: { fieldId: val, value: field.dependsOn?.value ?? '' } });
                            }
                        }}
                    >
                        <option value="">Siempre visible</option>
                        {eligibleParents.map((pf) => (
                            <option key={pf.id} value={pf.id}>{pf.label || 'Sin título'}</option>
                        ))}
                    </select>
                </div>

                {field.dependsOn?.fieldId && parentField && (
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-500">sea igual a</Label>
                        <select
                            className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={field.dependsOn.value ?? ''}
                            onChange={(e) => onChange({ dependsOn: { ...field.dependsOn!, value: e.target.value } })}
                        >
                            <option value="">Selecciona un valor…</option>
                            {parentField.options.map((o, i) => (
                                <option key={i} value={o.value}>{o.label}</option>
                            ))}
                            {parentField.allowOther && (
                                <option value="__other__">Otro</option>
                            )}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
}
