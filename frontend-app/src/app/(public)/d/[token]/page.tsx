'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle2, Clock, AlertCircle, ChevronRight, Loader2,
    CalendarDays, CreditCard, FileText, Sparkles, ArrowRight,
    Star, ChevronDown, ClipboardList,
} from 'lucide-react';
import {
    publicDealsApi,
    PublicDealData, PublicDealQuotation,
    BriefField, BriefResponses,
} from '@/features/deals/publicApi';
import { getImageUrl, cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CURRENCY_FALLBACKS: Record<string, string> = {
    GTQ: 'Q', USD: '$', EUR: '€', MXN: '$', GBP: '£', JPY: '¥',
    CAD: '$', AUD: '$', CHF: 'Fr', BRL: 'R$', COP: '$', ARS: '$',
    PEN: 'S/', CLP: '$', CRC: '₡', HNL: 'L', NIO: 'C$', DOP: 'RD$',
};

function getCurrencySymbol(deal: PublicDealData, quotation?: PublicDealQuotation) {
    if (quotation?.currency) return CURRENCY_FALLBACKS[quotation.currency] ?? quotation.currency;
    return deal.currency?.symbol ?? '$';
}

function fmt(val: number, symbol: string) {
    return `${symbol}${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
}

function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isExpired(validUntil?: string) {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
}

type PageState = 'brief' | 'waiting' | 'proposal' | 'approved';

function resolvePageState(deal: PublicDealData): PageState {
    const briefExists = !!deal.brief;
    const briefDone = deal.brief?.isCompleted ?? true;
    const hasQuotations = (deal.quotations?.length ?? 0) > 0;
    const isApproved = deal.quotations?.some(q => q.isApproved) ?? false;

    if (briefExists && !briefDone) return 'brief';
    if (!hasQuotations) return 'waiting';
    if (isApproved) return 'approved';
    return 'proposal';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skel({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-xl bg-zinc-100 dark:bg-white/[0.06]', className)} />;
}

function PageSkeleton() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0d0d0d]">
            <div className="h-14 border-b border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-[#111] px-6 flex items-center gap-3">
                <Skel className="w-8 h-8 rounded-xl" />
                <Skel className="w-36 h-4" />
            </div>
            <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
                <Skel className="w-52 h-8" />
                <Skel className="w-full h-20" />
                <Skel className="w-full h-72" />
            </div>
        </div>
    );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PageHeader({
    workspace,
    status,
    validUntil,
    brandColor,
}: {
    workspace: PublicDealData['workspace'];
    status?: string;
    validUntil?: string;
    brandColor: string;
}) {
    const expired = isExpired(validUntil);
    const statusMap: Record<string, { label: string; cls: string }> = {
        DRAFT:       { label: 'Borrador',       cls: 'bg-zinc-100 dark:bg-white/[0.07] text-zinc-500 dark:text-white/45' },
        SENT:        { label: 'Enviado',         cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
        VIEWED:      { label: 'Visto',           cls: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
        NEGOTIATING: { label: 'En negociación',  cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
        WON:         { label: 'Aprobado',        cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
        LOST:        { label: 'Cerrado',         cls: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400' },
    };
    const s = statusMap[status ?? ''];

    return (
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/[0.06]">
            <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    {workspace.logo ? (
                        <Image
                            src={getImageUrl(workspace.logo) ?? ''}
                            alt={workspace.businessName ?? 'Logo'}
                            width={28}
                            height={28}
                            className="object-contain rounded-lg"
                        />
                    ) : (
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                            style={{ backgroundColor: brandColor }}
                        >
                            {(workspace.businessName ?? '?')[0].toUpperCase()}
                        </div>
                    )}
                    <span className="text-[13px] font-semibold text-zinc-800 dark:text-white/80 truncate max-w-[160px]">
                        {workspace.businessName ?? 'Propuesta'}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {validUntil && (
                        <span className={cn(
                            'hidden sm:inline text-[11px] font-medium px-2 py-0.5 rounded-md',
                            expired
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                                : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-white/40',
                        )}>
                            {expired ? 'Expirada' : `Válida hasta ${formatDate(validUntil)}`}
                        </span>
                    )}
                    {s && (
                        <span className={cn('text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-lg', s.cls)}>
                            {s.label}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="text-zinc-400 dark:text-white/35">{icon}</div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/35">
                {title}
            </h2>
            <div className="flex-1 h-px bg-zinc-100 dark:bg-white/[0.06]" />
        </div>
    );
}

// ─── STATE 1: Brief form ───────────────────────────────────────────────────────

function BriefForm({
    deal,
    brandColor,
    onSubmitted,
}: {
    deal: PublicDealData;
    brandColor: string;
    onSubmitted: () => void;
}) {
    const { brief, client, workspace } = deal;
    const fields = brief?.template?.schema ?? [];

    const [responses, setResponses] = useState<BriefResponses>({});
    const [otherValues, setOtherValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Conditional visibility
    function isVisible(field: BriefField) {
        if (!field.dependsOn) return true;
        const { fieldId, value } = field.dependsOn;
        const response = responses[fieldId];
        if (Array.isArray(response)) return response.includes(value);
        return response === value;
    }

    function setResponse(fieldId: string, value: string | string[] | number) {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
        setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
    }

    function validate() {
        const errs: Record<string, string> = {};
        for (const field of fields) {
            if (!field.required || !isVisible(field)) continue;
            const val = responses[field.id];
            if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
                errs[field.id] = 'Este campo es obligatorio';
            }
        }
        return errs;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        // Merge "other" text values into checkbox/radio responses
        const finalResponses: BriefResponses = { ...responses };
        for (const [fieldId, otherText] of Object.entries(otherValues)) {
            if (!otherText.trim()) continue;
            const current = finalResponses[fieldId];
            if (Array.isArray(current)) {
                finalResponses[fieldId] = current.map(v => v === '__other__' ? otherText : v);
            } else if (current === '__other__') {
                finalResponses[fieldId] = otherText;
            }
        }

        setSubmitting(true);
        try {
            await publicDealsApi.submitBrief(
                // token is extracted from the URL param passed via deal.id context
                // We pass it via a closure from the parent
                (deal as PublicDealData & { _token: string })._token,
                finalResponses,
            );
            onSubmitted();
        } catch {
            // Silent — show generic error
            setErrors({ _form: 'Hubo un error al enviar. Por favor intenta de nuevo.' });
        } finally {
            setSubmitting(false);
        }
    }

    const inputCls = 'w-full h-10 rounded-xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.05] px-3.5 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 transition';
    const textareaCls = 'w-full rounded-xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.05] px-3.5 py-3 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 transition resize-none';

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            {/* Greeting */}
            <section className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-white/30">
                    Cuestionario de {workspace.businessName ?? 'tu proveedor'}
                </span>
                <h1 className="text-[28px] sm:text-[32px] font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                    Hola, {client.name} 👋
                </h1>
                <p className="text-[14px] text-zinc-500 dark:text-white/45 leading-relaxed max-w-lg">
                    Antes de preparar tu propuesta, necesitamos conocer un poco más sobre lo que buscas.
                    Tómate unos minutos para responder estas preguntas.
                </p>
            </section>

            {/* Template name */}
            {brief?.template?.name && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08]">
                    <ClipboardList className="w-3.5 h-3.5 text-zinc-500 dark:text-white/40" />
                    <span className="text-[12px] font-medium text-zinc-600 dark:text-white/55">
                        {brief.template.name}
                    </span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {fields.filter(isVisible).map((field, idx) => (
                    <div key={field.id} className="rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-[#1a1a1a] px-6 py-5">
                        <div className="mb-3">
                            <label className="block text-[14px] font-semibold text-zinc-900 dark:text-white leading-snug">
                                <span className="text-zinc-400 dark:text-white/25 font-normal mr-2 text-[12px]">{idx + 1}.</span>
                                {field.label}
                                {field.required && <span className="text-red-400 ml-1">*</span>}
                            </label>
                            {field.description && (
                                <p className="text-[12px] text-zinc-400 dark:text-white/35 mt-1 leading-snug">
                                    {field.description}
                                </p>
                            )}
                        </div>

                        {/* Text */}
                        {field.type === 'text' && (
                            <input
                                className={inputCls}
                                placeholder={field.tooltip ?? 'Tu respuesta...'}
                                value={(responses[field.id] as string) ?? ''}
                                onChange={e => setResponse(field.id, e.target.value)}
                            />
                        )}

                        {/* Textarea */}
                        {field.type === 'textarea' && (
                            <textarea
                                className={textareaCls}
                                rows={4}
                                placeholder={field.tooltip ?? 'Escribe aquí...'}
                                value={(responses[field.id] as string) ?? ''}
                                onChange={e => setResponse(field.id, e.target.value)}
                            />
                        )}

                        {/* Select */}
                        {field.type === 'select' && (
                            <div className="relative">
                                <select
                                    className={inputCls + ' pr-9 appearance-none cursor-pointer'}
                                    value={(responses[field.id] as string) ?? ''}
                                    onChange={e => setResponse(field.id, e.target.value)}
                                >
                                    <option value="">Selecciona una opción...</option>
                                    {field.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                            </div>
                        )}

                        {/* Radio */}
                        {field.type === 'radio' && (
                            <div className="space-y-2.5">
                                {field.options?.map(opt => (
                                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                                        <div className={cn(
                                            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                            responses[field.id] === opt
                                                ? 'border-zinc-900 dark:border-white'
                                                : 'border-zinc-300 dark:border-white/25 group-hover:border-zinc-500 dark:group-hover:border-white/50',
                                        )}>
                                            {responses[field.id] === opt && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            className="sr-only"
                                            name={field.id}
                                            value={opt}
                                            checked={responses[field.id] === opt}
                                            onChange={() => setResponse(field.id, opt)}
                                        />
                                        <span className="text-[13px] text-zinc-700 dark:text-white/70">{opt}</span>
                                    </label>
                                ))}
                                {field.allowOther && (
                                    <label className="flex items-start gap-2.5 cursor-pointer group">
                                        <div className={cn(
                                            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                                            responses[field.id] === '__other__'
                                                ? 'border-zinc-900 dark:border-white'
                                                : 'border-zinc-300 dark:border-white/25',
                                        )}>
                                            {responses[field.id] === '__other__' && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
                                            )}
                                        </div>
                                        <input type="radio" className="sr-only" name={field.id} value="__other__" checked={responses[field.id] === '__other__'} onChange={() => setResponse(field.id, '__other__')} />
                                        <div className="flex-1">
                                            <span className="text-[13px] text-zinc-700 dark:text-white/70">Otro</span>
                                            {responses[field.id] === '__other__' && (
                                                <input
                                                    autoFocus
                                                    className={inputCls + ' mt-2'}
                                                    placeholder="Especifica..."
                                                    value={otherValues[field.id] ?? ''}
                                                    onChange={e => setOtherValues(p => ({ ...p, [field.id]: e.target.value }))}
                                                />
                                            )}
                                        </div>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Checkbox */}
                        {field.type === 'checkbox' && (
                            <div className="space-y-2.5">
                                {field.options?.map(opt => {
                                    const current = (responses[field.id] as string[]) ?? [];
                                    const checked = current.includes(opt);
                                    return (
                                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                                            <div className={cn(
                                                'w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors',
                                                checked
                                                    ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white'
                                                    : 'border-zinc-300 dark:border-white/25 group-hover:border-zinc-500 dark:group-hover:border-white/50',
                                            )}>
                                                {checked && (
                                                    <svg className="w-2.5 h-2.5 text-white dark:text-zinc-900" viewBox="0 0 10 10" fill="none">
                                                        <path d="M1.5 5.5L4 8L8.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={checked}
                                                onChange={() => {
                                                    const next = checked ? current.filter(v => v !== opt) : [...current, opt];
                                                    setResponse(field.id, next);
                                                }}
                                            />
                                            <span className="text-[13px] text-zinc-700 dark:text-white/70">{opt}</span>
                                        </label>
                                    );
                                })}
                                {field.allowOther && (
                                    <label className="flex items-start gap-2.5 cursor-pointer group">
                                        <div className={cn(
                                            'w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                                            ((responses[field.id] as string[]) ?? []).includes('__other__')
                                                ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white'
                                                : 'border-zinc-300 dark:border-white/25',
                                        )}>
                                            {((responses[field.id] as string[]) ?? []).includes('__other__') && (
                                                <svg className="w-2.5 h-2.5 text-white dark:text-zinc-900" viewBox="0 0 10 10" fill="none">
                                                    <path d="M1.5 5.5L4 8L8.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[13px] text-zinc-700 dark:text-white/70">Otro</span>
                                            {((responses[field.id] as string[]) ?? []).includes('__other__') && (
                                                <input
                                                    autoFocus
                                                    className={inputCls + ' mt-2'}
                                                    placeholder="Especifica..."
                                                    value={otherValues[field.id] ?? ''}
                                                    onChange={e => setOtherValues(p => ({ ...p, [field.id]: e.target.value }))}
                                                />
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={((responses[field.id] as string[]) ?? []).includes('__other__')}
                                            onChange={() => {
                                                const current = (responses[field.id] as string[]) ?? [];
                                                const has = current.includes('__other__');
                                                setResponse(field.id, has ? current.filter(v => v !== '__other__') : [...current, '__other__']);
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Rating */}
                        {field.type === 'rating' && (
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => {
                                    const val = (responses[field.id] as number) ?? 0;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setResponse(field.id, star)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={cn(
                                                    'w-7 h-7 transition-colors',
                                                    star <= val
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-zinc-300 dark:text-white/20',
                                                )}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Field error */}
                        {errors[field.id] && (
                            <p className="text-[11px] text-red-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors[field.id]}
                            </p>
                        )}
                    </div>
                ))}

                {/* Form-level error */}
                {errors._form && (
                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-[13px] text-red-600 dark:text-red-400">{errors._form}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: brandColor }}
                    className="w-full h-12 rounded-2xl text-white text-[14px] font-bold hover:opacity-90 active:opacity-80 transition-opacity flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-60"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    {submitting ? 'Enviando...' : 'Enviar respuestas'}
                </button>
            </form>
        </div>
    );
}

// ─── STATE 2: Waiting for proposal ────────────────────────────────────────────

function WaitingView({ deal, brandColor }: { deal: PublicDealData; brandColor: string }) {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                style={{ backgroundColor: `${brandColor}20` }}
            >
                <Clock className="w-8 h-8" style={{ color: brandColor }} />
            </div>
            <h1 className="text-[24px] font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                {deal.brief?.isCompleted
                    ? '¡Gracias por tus respuestas!'
                    : 'Propuesta en preparación'}
            </h1>
            <p className="text-[14px] text-zinc-500 dark:text-white/45 leading-relaxed max-w-md mb-8">
                {deal.workspace.businessName ?? 'Tu proveedor'} está preparando tu propuesta personalizada.
                Te avisaremos cuando esté lista. Puedes volver a este mismo enlace para revisarla.
            </p>
            <div className="w-full max-w-xs rounded-2xl border border-zinc-100 dark:border-white/[0.07] bg-white dark:bg-[#1a1a1a] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-white/30 mb-1">
                    Este enlace es tuyo
                </p>
                <p className="text-[12px] text-zinc-500 dark:text-white/40 leading-snug">
                    Guarda esta URL. Cuando la propuesta esté lista, aparecerá aquí automáticamente.
                </p>
            </div>
        </div>
    );
}

// ─── STATE 3+4: Quotation + Approval ─────────────────────────────────────────

function QuotationCard({
    quotation,
    symbol,
    isSelected,
    onSelect,
    hasMultiple,
}: {
    quotation: PublicDealQuotation;
    symbol: string;
    isSelected: boolean;
    onSelect: () => void;
    hasMultiple: boolean;
}) {
    return (
        <div
            onClick={hasMultiple && !quotation.isApproved ? onSelect : undefined}
            className={cn(
                'rounded-2xl border transition-all duration-200 overflow-hidden',
                hasMultiple && !quotation.isApproved && 'cursor-pointer',
                quotation.isApproved
                    ? 'border-emerald-200 dark:border-emerald-700/50'
                    : isSelected
                        ? 'border-zinc-900 dark:border-white/80 shadow-md'
                        : 'border-zinc-200 dark:border-white/[0.08]',
            )}
        >
            {/* Header */}
            <div className={cn(
                'px-5 py-4 flex items-center justify-between border-b',
                quotation.isApproved
                    ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-100 dark:border-emerald-800/30'
                    : isSelected
                        ? 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-100 dark:border-white/[0.06]'
                        : 'bg-white dark:bg-[#1a1a1a] border-zinc-100 dark:border-white/[0.05]',
            )}>
                <div className="flex items-center gap-2.5">
                    {hasMultiple && !quotation.isApproved && (
                        <div className={cn(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                            isSelected
                                ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white'
                                : 'border-zinc-300 dark:border-white/30',
                        )}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900" />}
                        </div>
                    )}
                    <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white tracking-tight">
                        {quotation.optionName || 'Propuesta'}
                    </h3>
                    {quotation.currency && (
                        <span className="text-[10px] font-semibold text-zinc-400 dark:text-white/30 font-mono">
                            {quotation.currency}
                        </span>
                    )}
                </div>
                {quotation.isApproved && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aprobada
                    </span>
                )}
            </div>

            {/* Description */}
            {quotation.description && (
                <div className="px-5 pt-4">
                    <p className="text-[13px] text-zinc-500 dark:text-white/45 leading-relaxed">
                        {quotation.description}
                    </p>
                </div>
            )}

            {/* Items */}
            <div className="px-5 py-4 space-y-0 bg-white dark:bg-[#1a1a1a]">
                {quotation.items.map((item, i) => (
                    <div
                        key={item.id}
                        className={cn(
                            'flex items-start justify-between py-3 gap-4',
                            i < quotation.items.length - 1 && 'border-b border-zinc-100 dark:border-white/[0.05]',
                        )}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-zinc-800 dark:text-white/85 leading-snug">
                                {item.name}
                            </p>
                            {item.description && (
                                <p className="text-[11px] text-zinc-400 dark:text-white/35 mt-0.5 leading-snug">
                                    {item.description}
                                </p>
                            )}
                            <p className="text-[11px] text-zinc-400 dark:text-white/30 mt-0.5">
                                Cant. {item.quantity}{item.unitType ? ` ${item.unitType}` : ''} · {fmt(item.price, symbol)} c/u
                            </p>
                        </div>
                        <p className="text-[13px] font-semibold text-zinc-900 dark:text-white shrink-0 tabular-nums">
                            {fmt(item.subtotal, symbol)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="px-5 pb-5 space-y-1.5 border-t border-zinc-100 dark:border-white/[0.05] pt-4 bg-white dark:bg-[#1a1a1a]">
                {quotation.discount > 0 && (
                    <>
                        <div className="flex justify-between text-[12px] text-zinc-500 dark:text-white/45">
                            <span>Subtotal</span><span className="tabular-nums">{fmt(quotation.subtotal, symbol)}</span>
                        </div>
                        <div className="flex justify-between text-[12px] text-emerald-600 dark:text-emerald-400">
                            <span>Descuento</span><span className="tabular-nums">−{fmt(quotation.discount, symbol)}</span>
                        </div>
                    </>
                )}
                {quotation.taxTotal > 0 && (
                    <div className="flex justify-between text-[12px] text-zinc-500 dark:text-white/45">
                        <span>Impuestos</span><span className="tabular-nums">{fmt(quotation.taxTotal, symbol)}</span>
                    </div>
                )}
                <div className="flex justify-between items-baseline pt-1.5 border-t border-zinc-100 dark:border-white/[0.05]">
                    <span className="text-[13px] font-semibold text-zinc-700 dark:text-white/70">Total</span>
                    <span className="text-[22px] font-black text-zinc-900 dark:text-white tabular-nums leading-none">
                        {fmt(quotation.total, symbol)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function ProposalView({
    deal,
    brandColor,
    token,
}: {
    deal: PublicDealData;
    brandColor: string;
    token: string;
}) {
    const { quotations, proposalIntro, proposalTerms, paymentPlan, client, workspace } = deal;
    const hasApproved = quotations?.some(q => q.isApproved) ?? false;
    const hasMultiple = (quotations?.length ?? 0) > 1;

    const [selectedId, setSelectedId] = useState<string | null>(
        () => quotations?.find(q => q.isApproved)?.id ?? quotations?.[0]?.id ?? null
    );
    const [confirming, setConfirming] = useState(false);
    const [approving, setApproving] = useState(false);
    const [localApproved, setLocalApproved] = useState(hasApproved);
    const [localQuotations, setLocalQuotations] = useState(quotations ?? []);

    const selected = localQuotations.find(q => q.id === selectedId) ?? localQuotations[0];
    const isLocalApproved = localQuotations.some(q => q.isApproved);

    const handleApprove = async () => {
        if (!selectedId) return;
        setApproving(true);
        try {
            await publicDealsApi.approveQuotation(token, selectedId);
            setLocalQuotations(prev => prev.map(q => ({ ...q, isApproved: q.id === selectedId })));
            setLocalApproved(true);
            setConfirming(false);
        } catch {
            // no-op
        } finally {
            setApproving(false);
        }
    };

    const milestoneStyle: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
        PENDING:   { icon: <Clock className="w-3.5 h-3.5" />,        cls: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-white/40',         label: 'Pendiente' },
        PAID:      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', label: 'Pagado' },
        OVERDUE:   { icon: <AlertCircle className="w-3.5 h-3.5" />,  cls: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',                label: 'Vencido' },
        CANCELLED: { icon: <AlertCircle className="w-3.5 h-3.5" />,  cls: 'bg-zinc-50 dark:bg-white/[0.03] text-zinc-400 dark:text-white/30',           label: 'Cancelado' },
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

            {/* Greeting + intro */}
            <section>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-white/30">
                    Propuesta para
                </span>
                <h1 className="text-[28px] sm:text-[32px] font-black text-zinc-900 dark:text-white tracking-tight leading-tight mt-1 mb-4">
                    {client.name}
                </h1>
                {proposalIntro && (
                    <div className="text-[14px] text-zinc-600 dark:text-white/55 leading-relaxed whitespace-pre-line rounded-2xl border border-zinc-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] px-6 py-5">
                        {proposalIntro}
                    </div>
                )}
            </section>

            {/* Quotations */}
            {localQuotations.length > 0 && (
                <section>
                    <SectionTitle
                        icon={<FileText className="w-4 h-4" />}
                        title={hasMultiple ? 'Opciones de propuesta' : 'Propuesta'}
                    />

                    {/* Tab selector (multiple + not approved) */}
                    {hasMultiple && !isLocalApproved && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {localQuotations.map(q => (
                                <button
                                    key={q.id}
                                    onClick={() => setSelectedId(q.id)}
                                    className={cn(
                                        'px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border',
                                        selectedId === q.id
                                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                                            : 'bg-white dark:bg-white/[0.04] text-zinc-600 dark:text-white/55 border-zinc-200 dark:border-white/[0.08] hover:border-zinc-400',
                                    )}
                                >
                                    {q.optionName}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        {isLocalApproved
                            ? localQuotations.map(q => (
                                <QuotationCard key={q.id} quotation={q} symbol={getCurrencySymbol(deal, q)} isSelected={q.isApproved} onSelect={() => {}} hasMultiple={false} />
                            ))
                            : selected && (
                                <QuotationCard quotation={selected} symbol={getCurrencySymbol(deal, selected)} isSelected={true} onSelect={() => {}} hasMultiple={false} />
                            )
                        }
                    </div>

                    {/* Approval CTA */}
                    {!isLocalApproved && !isExpired(deal.validUntil) && (
                        <div className="mt-5">
                            {!confirming ? (
                                <button
                                    onClick={() => setConfirming(true)}
                                    style={{ backgroundColor: brandColor }}
                                    className="w-full h-12 rounded-2xl text-white text-[14px] font-bold hover:opacity-90 active:opacity-80 transition-opacity flex items-center justify-center gap-2.5 shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {hasMultiple ? `Aprobar "${selected?.optionName}"` : 'Aprobar esta propuesta'}
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                </button>
                            ) : (
                                <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1a1a1a] p-5">
                                    <p className="text-[14px] font-semibold text-zinc-900 dark:text-white mb-1">
                                        ¿Confirmar aprobación?
                                    </p>
                                    <p className="text-[12px] text-zinc-500 dark:text-white/40 mb-4 leading-snug">
                                        Al aprobar, {workspace.businessName ?? 'el equipo'} recibirá una notificación
                                        y podrá proceder con el proyecto.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleApprove}
                                            disabled={approving}
                                            style={{ backgroundColor: brandColor }}
                                            className="flex-1 h-10 rounded-xl text-white text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {approving ? 'Aprobando...' : 'Sí, aprobar'}
                                        </button>
                                        <button
                                            onClick={() => setConfirming(false)}
                                            disabled={approving}
                                            className="px-4 h-10 rounded-xl border border-zinc-200 dark:border-white/[0.1] text-[13px] font-medium text-zinc-600 dark:text-white/60 hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors disabled:opacity-40"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Approval banner */}
                    {isLocalApproved && (
                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/15 px-5 py-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[14px] font-semibold text-emerald-800 dark:text-emerald-300">
                                    Propuesta aprobada
                                </p>
                                <p className="text-[12px] text-emerald-700/70 dark:text-emerald-400/60 mt-0.5 leading-snug">
                                    {workspace.businessName ?? 'El equipo'} ya fue notificado y puede comenzar con el
                                    proyecto. Revisa el plan de pagos a continuación.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Payment plan (only visible after approval) */}
            {isLocalApproved && paymentPlan?.milestones?.length && (
                <section>
                    <SectionTitle icon={<CreditCard className="w-4 h-4" />} title="Plan de Pagos" />
                    <div className="space-y-3">
                        {paymentPlan.milestones.map((m, i) => {
                            const approvedQ = localQuotations.find(q => q.isApproved);
                            const sym = getCurrencySymbol(deal, approvedQ);
                            const style = milestoneStyle[m.status] ?? milestoneStyle['PENDING'];
                            return (
                                <div key={m.id} className="flex items-start gap-4 rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-[#1a1a1a] px-5 py-4">
                                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 text-[11px] font-bold text-zinc-500 dark:text-white/40 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div>
                                                <p className="text-[14px] font-semibold text-zinc-900 dark:text-white leading-snug">{m.name}</p>
                                                {m.description && <p className="text-[12px] text-zinc-400 dark:text-white/35 mt-0.5 leading-snug">{m.description}</p>}
                                                {m.dueDate && (
                                                    <p className="text-[11px] text-zinc-400 dark:text-white/35 mt-1 flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />{formatDate(m.dueDate)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[15px] font-bold text-zinc-900 dark:text-white tabular-nums">{fmt(m.amount, sym)}</p>
                                                {m.percentage != null && <p className="text-[11px] text-zinc-400 dark:text-white/35">{m.percentage}%</p>}
                                            </div>
                                        </div>
                                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md mt-2.5', style.cls)}>
                                            {style.icon}{style.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Terms */}
            {proposalTerms && (
                <section>
                    <SectionTitle icon={<FileText className="w-4 h-4" />} title="Términos y Condiciones" />
                    <div className="rounded-2xl border border-zinc-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] px-6 py-5">
                        <p className="text-[12px] text-zinc-500 dark:text-white/40 leading-relaxed whitespace-pre-line">{proposalTerms}</p>
                    </div>
                </section>
            )}

            {/* Portal CTA */}
            <section className="rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                <div className="px-6 py-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-zinc-500 dark:text-white/40" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white mb-1">
                            Accede a tu portal de cliente
                        </h3>
                        <p className="text-[12px] text-zinc-500 dark:text-white/40 leading-relaxed mb-4">
                            Crea una cuenta para consultar el historial de tus proyectos, ver el estado
                            de pagos y descargar documentos en cualquier momento.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={`/register?email=${encodeURIComponent(client.email ?? '')}&role=client`}
                                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[12px] font-semibold hover:opacity-90 transition-opacity"
                            >
                                Crear cuenta gratis <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center h-9 px-4 rounded-xl border border-zinc-200 dark:border-white/[0.1] text-[12px] font-medium text-zinc-600 dark:text-white/60 hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors"
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function PublicDealPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);

    const [deal, setDeal] = useState<PublicDealData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [pageState, setPageState] = useState<PageState>('brief');

    useEffect(() => {
        publicDealsApi.getDeal(token)
            .then(data => {
                // Attach token so BriefForm can use it via closure
                (data as PublicDealData & { _token: string })._token = token;
                setDeal(data);
                setPageState(resolvePageState(data));
            })
            .catch(() => setNotFound(true))
            .finally(() => setIsLoading(false));
    }, [token]);

    if (isLoading) return <PageSkeleton />;

    if (notFound || !deal) {
        return (
            <div className="min-h-screen bg-[#fafafa] dark:bg-[#0d0d0d] flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-5">
                        <FileText className="w-7 h-7 text-zinc-400 dark:text-white/30" />
                    </div>
                    <h1 className="text-[20px] font-bold text-zinc-900 dark:text-white mb-2">
                        Propuesta no encontrada
                    </h1>
                    <p className="text-[13px] text-zinc-500 dark:text-white/40 leading-relaxed">
                        El enlace puede haber expirado o ser incorrecto. Contacta a quien te lo envió.
                    </p>
                </div>
            </div>
        );
    }

    const brandColor = deal.workspace.brandColor || '#18181b';

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0c] font-sans">
            <PageHeader
                workspace={deal.workspace}
                status={deal.status}
                validUntil={deal.validUntil}
                brandColor={brandColor}
            />

            {pageState === 'brief' && (
                <BriefForm
                    deal={deal}
                    brandColor={brandColor}
                    onSubmitted={() => {
                        // Mark brief as completed locally and transition to waiting
                        setDeal(prev => prev
                            ? { ...prev, brief: prev.brief ? { ...prev.brief, isCompleted: true } : prev.brief }
                            : prev
                        );
                        setPageState('waiting');
                    }}
                />
            )}

            {pageState === 'waiting' && (
                <WaitingView deal={deal} brandColor={brandColor} />
            )}

            {(pageState === 'proposal' || pageState === 'approved') && (
                <ProposalView deal={deal} brandColor={brandColor} token={token} />
            )}

            <footer className="border-t border-zinc-200 dark:border-white/[0.06] mt-4">
                <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-[11px] text-zinc-400 dark:text-white/25">
                        Propuesta generada con{' '}
                        <span className="font-semibold text-zinc-500 dark:text-white/35">Hi Krew</span>
                    </p>
                    {deal.client.email && (
                        <p className="text-[11px] text-zinc-400 dark:text-white/25">
                            Enviado a {deal.client.email}
                        </p>
                    )}
                </div>
            </footer>
        </div>
    );
}
