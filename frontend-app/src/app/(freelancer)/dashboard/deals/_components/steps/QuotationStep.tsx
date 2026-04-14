/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useQuotations } from '@/hooks/use-quotations';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { ServicePickerDialog } from './ServicePickerDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Trash2, Package, PenLine, CheckCircle2,
    FileText, Calendar, Tag,
    Save, X, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

interface QuotationStepProps {
    deal: Record<string, any>;
    dealId: string;
    publicToken?: string | null;
    currency?: { code: string; symbol: string };
    readonly?: boolean;
    onUpdate?: () => void | Promise<void>;
    updateDeal: (id: string, partial: Record<string, any>) => Promise<any>;
}

const CHARGE_LABELS: Record<string, string> = {
    ONE_TIME: 'Una vez',
    HOURLY: '/hr',
    RECURRING: '/mes',
};

// ── Item edit state shape ─────────────────────────────────────────────────────
interface ItemEditState {
    itemId: string | null; // null = new item (create mode)
    name: string;
    description: string;
    price: string;
    quantity: string;
    chargeType: 'ONE_TIME' | 'HOURLY' | 'RECURRING';
    discount: string;
    isTaxable: boolean;
}

const emptyItemEdit = (): ItemEditState => ({
    itemId: null,
    name: '',
    description: '',
    price: '0',
    quantity: '1',
    chargeType: 'ONE_TIME',
    discount: '0',
    isTaxable: true,
});

export function QuotationStep({ deal, dealId, publicToken, currency, readonly, onUpdate, updateDeal }: QuotationStepProps) {
    const {
        quotations,
        fetchQuotations,
        createQuotation,
        updateQuotation,
        deleteQuotation,
        addItem,
        updateItem,
        deleteItem,
        isLoading,
    } = useQuotations(dealId, deal?.workspace?.id || deal?.workspaceId);

    const { workspace } = useWorkspaceSettings();
    const workspaceCurrencies: Array<{ code: string; name: string; symbol: string; isDefault?: boolean }> =
        workspace?.currencies || [{ code: 'GTQ', name: 'Quetzales', symbol: 'Q', isDefault: true }];

    const [activeQuotationId, setActiveQuotationId] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    // 2.1 + 2.2 — Item edit Sheet state
    const [itemSheetOpen, setItemSheetOpen] = useState(false);
    const [itemEdit, setItemEdit] = useState<ItemEditState>(emptyItemEdit());
    const [isSavingItem, setIsSavingItem] = useState(false);

    // 2.3 — Inline quotation rename state
    const [renamingQuotationId, setRenamingQuotationId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    // Item delete confirmation
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

    // Quotation delete confirmation
    const [deleteQuotationId, setDeleteQuotationId] = useState<string | null>(null);

    // Props config state
    const [proposalIntroLocal, setProposalIntroLocal] = useState(deal?.proposalIntro || '');
    const [proposalTermsLocal, setProposalTermsLocal] = useState(deal?.proposalTerms || '');
    const [validUntilLocal, setValidUntilLocal] = useState(
        deal?.validUntil ? new Date(deal.validUntil).toISOString().split('T')[0] : ''
    );
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

    useEffect(() => {
        if (quotations.length > 0 && !activeQuotationId) {
            setActiveQuotationId(quotations[0].id);
        }
    }, [quotations, activeQuotationId]);

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            await updateDeal(dealId, {
                proposalIntro: proposalIntroLocal || null,
                proposalTerms: proposalTermsLocal || null,
                validUntil: validUntilLocal ? new Date(validUntilLocal).toISOString() : null,
            });
            toast.success('Configuración guardada correctamente');
        } catch {
            toast.error('Error al guardar la configuración');
        } finally {
            setIsSavingConfig(false);
        }
    };

    const activeQuotation = quotations.find(q => q.id === activeQuotationId);

    // Use the per-quotation currency if set, otherwise fall back to workspace prop
    const activeCurrencyCode = activeQuotation?.currency || currency?.code || 'GTQ';
    const activeCurrencySymbol = (() => {
        if (activeQuotation?.currency) {
            const found = workspaceCurrencies.find(c => c.code === activeQuotation.currency);
            return found?.symbol ?? activeQuotation.currency;
        }
        return currency?.symbol || 'Q';
    })();
    const currencySymbol = activeCurrencySymbol;
    const fmt = (n: number) => `${currencySymbol}${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;

    // ── Item Sheet handlers ───────────────────────────────────────────────────

    const openNewItem = () => {
        setItemEdit(emptyItemEdit());
        setItemSheetOpen(true);
    };

    const openEditItem = (item: Record<string, any>) => {
        // Fix 1.1 — seed all fields
        setItemEdit({
            itemId: item.id,
            name: item.name ?? '',
            description: item.description ?? '',
            price: String(item.price ?? 0),
            quantity: String(item.quantity ?? 1),
            chargeType: item.chargeType ?? 'ONE_TIME',
            discount: String(item.discount ?? 0),
            isTaxable: item.isTaxable ?? true,
        });
        setItemSheetOpen(true);
    };

    const openFromCatalog = (service: Record<string, any>) => {
        const priceForCurrency = service.basePrice?.[activeCurrencyCode] ?? 0;
        setItemEdit({
            itemId: null,
            name: service.name ?? '',
            description: service.description ?? '',
            price: String(priceForCurrency),
            quantity: '1',
            chargeType: service.chargeType ?? 'ONE_TIME',
            discount: '0',
            isTaxable: service.isTaxable ?? true,
        });
        setItemSheetOpen(true);
    };

    const handleSaveItem = async () => {
        if (!activeQuotationId) return;
        if (!itemEdit.name.trim()) { toast.error('El ítem necesita un nombre'); return; }
        setIsSavingItem(true);

        const payload = {
            name: itemEdit.name.trim(),
            description: itemEdit.description || undefined,
            price: Number(itemEdit.price),
            quantity: Number(itemEdit.quantity),
            chargeType: itemEdit.chargeType,
            discount: Number(itemEdit.discount) || 0,
            isTaxable: itemEdit.isTaxable,
        };

        let result;
        if (itemEdit.itemId) {
            result = await updateItem(activeQuotationId, itemEdit.itemId, payload);
        } else {
            result = await addItem(activeQuotationId, payload);
        }

        setIsSavingItem(false);
        if (result) {
            setItemSheetOpen(false);
            toast.success(itemEdit.itemId ? 'Ítem actualizado' : 'Ítem agregado');
            onUpdate?.();
        }
    };

    const handleCatalogSelect = (service: Record<string, any>) => {
        setPickerOpen(false);
        openFromCatalog(service);
    };

    const handleDeleteItem = async () => {
        if (!activeQuotationId || !deleteItemId) return;
        await deleteItem(activeQuotationId, deleteItemId);
        setDeleteItemId(null);
        toast.success('Ítem eliminado');
        onUpdate?.();
    };

    const handleDeleteQuotation = async () => {
        if (!deleteQuotationId) return;
        const success = await deleteQuotation(deleteQuotationId);
        if (success) {
            toast.success('Cotización eliminada');
            setDeleteQuotationId(null);
            
            // Si acabamos de borrar la activa, limpiar o seleccionar otra
            if (activeQuotationId === deleteQuotationId) {
                const remaining = quotations.filter(q => q.id !== deleteQuotationId);
                setActiveQuotationId(remaining.length > 0 ? remaining[0].id : null);
            }
            onUpdate?.();
        } else {
            toast.error('Error al eliminar la opción de cotización');
        }
    };

    // ── Quotation tab rename (2.3) ────────────────────────────────────────────

    const startRename = (q: { id: string; optionName: string }) => {
        setRenamingQuotationId(q.id);
        setRenameValue(q.optionName);
    };

    const commitRename = async () => {
        if (!renamingQuotationId || !renameValue.trim()) { setRenamingQuotationId(null); return; }
        await updateQuotation(renamingQuotationId, { optionName: renameValue.trim() });
        setRenamingQuotationId(null);
    };

    // ── Other handlers ────────────────────────────────────────────────────────

    const handleApprove = async (quotationId: string) => {
        await updateQuotation(quotationId, { isApproved: true });
        toast.success('Cotización aprobada');
    };

    const handleDiscountChange = async (value: string) => {
        if (!activeQuotationId) return;
        const num = Number(value);
        if (isNaN(num) || num < 0) return;
        await updateQuotation(activeQuotationId, { discount: num });
        onUpdate?.();
    };

    return (
        <div className="space-y-6">



            {/* Quotation Option Tabs — 2.3 rename on double-click */}
            <div className="flex items-center gap-2 flex-wrap">
                {quotations.map((q) => (
                    <div key={q.id} className="relative flex items-center group/tab">
                        {renamingQuotationId === q.id ? (
                            <div className="flex items-center gap-1">
                                <Input
                                    autoFocus
                                    className="h-7 w-36 text-xs rounded-lg px-2"
                                    value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingQuotationId(null); }}
                                    onBlur={commitRename}
                                />
                            </div>
                        ) : (
                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setActiveQuotationId(q.id)}
                                    onDoubleClick={() => !readonly && startRename(q)}
                                    title={readonly ? undefined : 'Doble clic para renombrar'}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all pr-8',
                                        q.id === activeQuotationId
                                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-sm'
                                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    )}
                                >
                                    {q.isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                    {q.optionName}
                                </button>
                                {!readonly && q.id === activeQuotationId && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteQuotationId(q.id); }}
                                        className="absolute right-2 p-1 rounded-md transition-colors text-white/70 hover:text-white hover:bg-white/20 dark:text-black/60 dark:hover:text-black dark:hover:bg-black/10"
                                        title="Eliminar opción"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {!readonly && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-dashed h-8 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        onClick={() => createQuotation({})}
                        disabled={isLoading}
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Nueva opción
                    </Button>
                )}
            </div>

            {/* Empty state */}
            {quotations.length === 0 && !isLoading && (
                <div className="h-32 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-400 gap-2 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <p className="font-medium text-[13px] text-zinc-600 dark:text-zinc-300">Sin cotizaciones aún</p>
                    </div>
                    <Button size="sm" variant="secondary" className="h-7 text-xs rounded-lg mt-1" onClick={() => createQuotation({})}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear Opción A
                    </Button>
                </div>
            )}

            {/* Active Quotation Canvas */}
            {activeQuotation && (
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                    {/* Currency selector for this quotation - Moved to top */}
                    {!readonly && workspaceCurrencies.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-zinc-400" /> Moneda de la cotización
                            </span>
                            {workspaceCurrencies.length === 1 ? (
                                <span className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 font-medium border border-zinc-200 dark:border-zinc-700">
                                    {workspaceCurrencies[0].code} ({workspaceCurrencies[0].symbol})
                                </span>
                            ) : (
                                <Select
                                    value={activeCurrencyCode}
                                    onValueChange={(val) => updateQuotation(activeQuotation!.id, { currency: val })}
                                >
                                    <SelectTrigger className="h-8 w-40 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workspaceCurrencies.map((c: { code: string; symbol: string; name: string }) => (
                                            <SelectItem key={c.code} value={c.code} className="text-xs">
                                                {c.code} ({c.symbol}) — {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    {/* Items table header */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-5">Servicio / Ítem</div>
                        <div className="col-span-2">Tipo</div>
                        <div className="col-span-1 text-center">Cant.</div>
                        <div className="col-span-2 text-right">Precio</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                    </div>

                    {/* Items */}
                    {(activeQuotation.items || []).length === 0 ? (
                        <div className="px-4 py-8 text-center text-zinc-400 text-sm">
                            Sin ítems. Agrega servicios del catálogo o crea un ítem manual.
                        </div>
                    ) : (
                        (activeQuotation.items || []).map((item: Record<string, any>) => {
                            // Use the backend-computed subtotal (@AfterLoad on QuotationItem).
                            // Fall back to local calculation (with Number() guards for PG numeric
                            // strings) in case of stale data from before the @AfterLoad fix.
                            const lineTotal =
                                item.subtotal !== undefined
                                    ? Number(item.subtotal)
                                    : Math.max(0, (Number(item.price) - Number(item.discount || 0)) * Number(item.quantity));
                            return (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50 group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
                                    <div className="col-span-5">
                                        <div className="font-medium text-[13px] text-zinc-900 dark:text-zinc-100">{item.name}</div>
                                        {item.description && <div className="text-[11px] text-zinc-500 truncate max-w-[240px] mt-0.5">{item.description}</div>}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                            {CHARGE_LABELS[item.chargeType] || item.chargeType}
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-center text-[13px] text-zinc-600 dark:text-zinc-400">{item.quantity}</div>
                                    <div className="col-span-2 text-right text-[13px] text-zinc-600 dark:text-zinc-400">{fmt(Number(item.price))}</div>
                                    <div className="col-span-2 text-right flex items-center justify-end gap-1">
                                        <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{fmt(lineTotal)}</span>
                                        {!readonly && (
                                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                                <button
                                                    onClick={() => openEditItem(item)}
                                                    className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                                                >
                                                    <PenLine className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteItemId(item.id)}
                                                    className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Add buttons */}
                    {!readonly && (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-50/30 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-800">
                            <Button size="sm" variant="secondary" className="h-7 text-xs rounded-lg text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700" onClick={() => setPickerOpen(true)}>
                                <Package className="w-3.5 h-3.5 mr-1.5" /> Del catálogo
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={openNewItem}>
                                <Plus className="w-3.5 h-3.5 mr-1.5" /> Ítem manual
                            </Button>
                        </div>
                    )}

                    {/* Totals — 2.4 discount input */}
                    <div className="px-4 py-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">


                        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                            <span>Subtotal</span>
                            <span>{fmt(activeQuotation.subtotal ?? 0)}</span>
                        </div>

                        {/* 2.4 — Editable global discount */}
                        {!readonly ? (
                            <div className="flex items-center justify-between text-sm text-emerald-700 dark:text-emerald-400">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span>Descuento global</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-400 text-xs">{currencySymbol}</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        className="h-7 w-24 text-right text-sm rounded-lg px-2 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                                        defaultValue={activeQuotation.discount ?? 0}
                                        onBlur={(e) => handleDiscountChange(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleDiscountChange((e.target as HTMLInputElement).value); }}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        ) : (
                            Number(activeQuotation.discount) > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Descuento</span>
                                    <span>- {fmt(activeQuotation.discount)}</span>
                                </div>
                            )
                        )}

                        {Number(activeQuotation.taxTotal) > 0 && (
                            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                                <span>Impuestos</span>
                                <span>{fmt(activeQuotation.taxTotal)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-1 border-t border-zinc-200 dark:border-zinc-700 mt-1">
                            <span>Total</span>
                            <span>{fmt(activeQuotation.total ?? 0)}</span>
                        </div>
                    </div>

                    {/* Approve button (if multiple quotations) */}
                    {!readonly && quotations.length > 1 && !activeQuotation.isApproved && (
                        <div className="px-4 py-3 flex justify-end border-t border-zinc-200 dark:border-zinc-800">
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => handleApprove(activeQuotation.id)}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Aprobar esta opción
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Proposal Global Configurations */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm mt-6">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" /> Configuración General
                    </h3>
                </div>
                {!readonly ? (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Mensaje de Introducción</label>
                                <textarea
                                    className="w-full h-24 p-3 text-[13px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 resize-y focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-shadow placeholder:text-zinc-400"
                                    placeholder="Mensaje o saludo para acompañar las opciones..."
                                    value={proposalIntroLocal}
                                    onChange={(e) => setProposalIntroLocal(e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2.5">
                                    <label className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Términos y Condiciones</label>
                                    <textarea
                                        className="w-full h-20 p-3 text-[13px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 resize-y focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-shadow placeholder:text-zinc-400"
                                        placeholder="Cláusulas aplicables en esta propuesta..."
                                        value={proposalTermsLocal}
                                        onChange={(e) => setProposalTermsLocal(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Válida hasta
                                    </label>
                                    <Input
                                        type="date"
                                        className="h-9 px-3 text-[13px] rounded-lg bg-white dark:bg-zinc-950"
                                        value={validUntilLocal}
                                        onChange={(e) => setValidUntilLocal(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button size="sm" onClick={handleSaveConfig} disabled={isSavingConfig} className="gap-2">
                                <Save className="w-4 h-4" /> {isSavingConfig ? 'Guardando...' : 'Guardar notas'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-70">
                        <div className="space-y-2"><p className="text-xs font-bold">Intro:</p> <p className="text-sm whitespace-pre-wrap">{deal.proposalIntro || 'Sin intro'}</p></div>
                        <div className="space-y-2"><p className="text-xs font-bold">Términos:</p> <p className="text-sm whitespace-pre-wrap">{deal.proposalTerms || 'Sin términos'}</p></div>
                        <div className="space-y-2 md:col-span-2"><p className="text-xs font-bold">Válida hasta:</p> <p className="text-sm">{deal.validUntil ? new Date(deal.validUntil).toLocaleDateString() : 'N/A'}</p></div>
                    </div>
                )}
            </div>

            {/* ── Item Edit Sheet (2.1 + 2.2) ─────────────────────────────────────── */}
            <Sheet open={itemSheetOpen} onOpenChange={setItemSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 border-l border-zinc-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-[#0A0A0A] flex flex-col h-full">
                    <div className="flex flex-col px-6 py-6 border-b border-zinc-100 dark:border-zinc-800">
                        <SheetHeader className="text-left shrink-0">
                            <SheetTitle className="text-xl tracking-tight">{itemEdit.itemId ? 'Editar ítem' : 'Nuevo ítem'}</SheetTitle>
                            <SheetDescription className="text-sm">
                                {itemEdit.itemId
                                    ? 'Modifica los detalles de este ítem en la cotización.'
                                    : 'Completa los datos del nuevo ítem antes de agregarlo.'}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="item-name" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nombre <span className="text-rose-500">*</span></Label>
                            <Input
                                id="item-name"
                                placeholder="Ej. Diseño de logotipo"
                                value={itemEdit.name}
                                onChange={e => setItemEdit(p => ({ ...p, name: e.target.value }))}
                                className="h-10 rounded-xl"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="item-desc" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Descripción</Label>
                            <textarea
                                id="item-desc"
                                rows={4}
                                className="w-full p-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400"
                                placeholder="Detalla qué incluye este servicio o ítem..."
                                value={itemEdit.description}
                                onChange={e => setItemEdit(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>

                        {/* Price & Quantity */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="item-price" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Precio unitario</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">{activeCurrencyCode}</span>
                                    <Input
                                        id="item-price"
                                        type="number"
                                        min={0}
                                        className="pl-10 h-10 rounded-xl"
                                        value={itemEdit.price}
                                        onChange={e => setItemEdit(p => ({ ...p, price: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-qty" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Cantidad</Label>
                                <Input
                                    id="item-qty"
                                    type="number"
                                    min={1}
                                    value={itemEdit.quantity}
                                    onChange={e => setItemEdit(p => ({ ...p, quantity: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Charge Type */}
                        <div className="space-y-1.5">
                            <Label>Tipo de cargo</Label>
                            <Select
                                onValueChange={val => setItemEdit(p => ({ ...p, chargeType: val as 'ONE_TIME' | 'HOURLY' | 'RECURRING' }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ONE_TIME">Una vez</SelectItem>
                                    <SelectItem value="HOURLY">Por hora</SelectItem>
                                    <SelectItem value="RECURRING">Recurrente/mes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Discount */}
                        <div className="space-y-1.5">
                            <Label htmlFor="item-discount" className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> Descuento por ítem
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">{activeCurrencyCode}</span>
                                <Input
                                    id="item-discount"
                                    type="number"
                                    min={0}
                                    className="pl-10"
                                    placeholder="0.00"
                                    value={itemEdit.discount}
                                    onChange={e => setItemEdit(p => ({ ...p, discount: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* isTaxable */}
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                            <input
                                id="item-taxable"
                                type="checkbox"
                                className="w-4 h-4 accent-primary"
                                checked={itemEdit.isTaxable}
                                onChange={e => setItemEdit(p => ({ ...p, isTaxable: e.target.checked }))}
                            />
                            <label htmlFor="item-taxable" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                Aplicar impuestos a este ítem
                            </label>
                        </div>

                        {/* Line total preview */}
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Subtotal del ítem</span>
                            <span className="font-bold text-zinc-900 dark:text-white">
                                {fmt(Math.max(0, Number(itemEdit.price) * Number(itemEdit.quantity) - Number(itemEdit.discount || 0)))}
                            </span>
                        </div>
                    </div>

                    <SheetFooter className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setItemSheetOpen(false)}>
                            <X className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                        <Button className="flex-1" onClick={handleSaveItem} disabled={isSavingItem}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSavingItem ? 'Guardando...' : (itemEdit.itemId ? 'Guardar cambios' : 'Agregar ítem')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Service Picker Dialog */}
            <ServicePickerDialog
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onSelect={handleCatalogSelect}
                currency={deal?.currency?.code || undefined}
                currencySymbol={activeCurrencySymbol}
                workspaceId={deal?.workspace?.id || deal?.workspaceId}
            />

            {/* Item delete confirmation */}
            <AlertDialog open={!!deleteItemId} onOpenChange={o => !o && setDeleteItemId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este ítem?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el ítem de la cotización y recalculará los totales.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={handleDeleteItem}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Quotation option delete confirmation */}
            <AlertDialog open={!!deleteQuotationId} onOpenChange={o => !o && setDeleteQuotationId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta opción de cotización?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará la opción entera junto con todos los ítems que contenga. Esta acción es irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-rose-600 text-white hover:bg-rose-700" onClick={handleDeleteQuotation}>
                            Eliminar opción
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
