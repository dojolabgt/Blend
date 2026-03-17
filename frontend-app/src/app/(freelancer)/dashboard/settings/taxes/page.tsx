'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import api from '@/lib/api';
import {
    Plus,
    Pencil,
    Trash2,
    Percent,
    X,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import paisData from '@/data/localization/pais.json';
import { Switch } from '@/components/ui/switch';
import { AppInput } from '@/components/common/AppInput';

// ─── Types ──────────────────────────────────────────────────────────────────

type TaxAppliesTo = 'all' | 'services' | 'products';

interface WorkspaceTax {
    id: string;
    key: string;
    label: string;
    rate: number;
    appliesTo: TaxAppliesTo;
    description?: string;
    isDefault: boolean;
    isActive: boolean;
    order: number;
}

interface WorkspacePrefs {
    taxInclusivePricing: boolean;
    taxReporting: boolean;
    taxId?: string;
    taxType?: string;
    country?: string;
}

const APPLIES_TO_LABELS: Record<TaxAppliesTo, string> = {
    all: 'taxes.all',
    services: 'taxes.services',
    products: 'taxes.products',
};

const emptyForm = {
    key: '',
    label: '',
    rate: '',
    appliesTo: 'all' as TaxAppliesTo,
    description: '',
    isDefault: false,
    isActive: true,
};

// ─── Tax Modal ───────────────────────────────────────────────────────────────

function TaxModal({ open, onClose, onSave, initial }: {
    open: boolean;
    onClose: () => void;
    onSave: (data: typeof emptyForm) => Promise<void>;
    initial?: WorkspaceTax | null;
}) {
    const { t } = useWorkspaceSettings();
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initial) {
            setForm({
                key: initial.key,
                label: initial.label,
                rate: String(Math.round(Number(initial.rate) * 100)),
                appliesTo: initial.appliesTo,
                description: initial.description ?? '',
                isDefault: initial.isDefault,
                isActive: initial.isActive,
            });
        } else {
            setForm(emptyForm);
        }
        setError(null);
    }, [initial, open]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const rateNum = parseFloat(form.rate);
        if (!form.label.trim()) { setError(t('taxes.errNameReq')); return; }
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) { setError(t('taxes.errRateRange')); return; }
        setSaving(true); setError(null);
        try {
            await onSave({ ...form, rate: String(rateNum / 100) });
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string } } };
            setError(apiErr?.response?.data?.message ?? t('taxes.errSaving'));
        } finally { setSaving(false); }
    };

    const inputCls = 'w-full h-10 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] px-3.5 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white/30 transition';
    const labelCls = 'block text-[12px] font-medium text-gray-700 dark:text-white/75 mb-1.5';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
                        {initial ? t('taxes.editTax') : t('taxes.newTax')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelCls}>{t('taxes.name')}</label>
                        <input className={inputCls} placeholder={t('taxes.namePlaceholder')} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                    </div>
                    <div>
                        <label className={labelCls}>
                            {t('taxes.internalKey')}
                            <span className="text-gray-400 dark:text-white/35 font-normal ml-1">{t('taxes.uniqueSlug')}</span>
                        </label>
                        <input className={inputCls} placeholder={t('taxes.keyPlaceholder')} value={form.key} disabled={!!initial} onChange={e => setForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))} />
                        {initial && <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1">{t('taxes.keyNoChange')}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>{t('taxes.rate')}</label>
                            <div className="relative">
                                <input className={inputCls + ' pr-9'} placeholder="12" type="number" min={0} max={100} step={0.01} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} />
                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/35 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>{t('taxes.appliesTo')}</label>
                            <select className={inputCls + ' cursor-pointer'} value={form.appliesTo} onChange={e => setForm(f => ({ ...f, appliesTo: e.target.value as TaxAppliesTo }))}>
                                <option value="all">{t('taxes.all')}</option>
                                <option value="services">{t('taxes.services')}</option>
                                <option value="products">{t('taxes.products')}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>
                            {t('taxes.description')}
                            <span className="text-gray-400 dark:text-white/35 font-normal ml-1">{t('taxes.optional')}</span>
                        </label>
                        <input className={inputCls} placeholder={t('taxes.descPlaceholder')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="flex gap-6 pt-1">
                        <label className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-white/70 cursor-pointer select-none">
                            <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
                            {t('taxes.mainTax')}
                        </label>
                        <label className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-white/70 cursor-pointer select-none">
                            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                            {t('taxes.active')}
                        </label>
                    </div>
                    {error && (
                        <p className="text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl text-[13px] font-medium text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition"
                        >
                            {t('taxes.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-9 px-4 rounded-xl text-[13px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white/90 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {saving ? t('taxes.saving') : t('taxes.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TaxesPage() {
    const { t } = useWorkspaceSettings();
    const { activeWorkspace } = useAuth();

    const [taxes, setTaxes] = useState<WorkspaceTax[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<WorkspaceTax | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [prefs, setPrefs] = useState<WorkspacePrefs>({
        taxInclusivePricing: false,
        taxReporting: false,
        taxId: '',
        taxType: '',
        country: 'GT',
    });
    const [taxIdValue, setTaxIdValue] = useState('');
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [prefsSaved, setPrefsSaved] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get('/workspaces/current/taxes');
            setTaxes(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (activeWorkspace) {
            const ws = activeWorkspace as { taxInclusivePricing?: boolean; taxReporting?: boolean; taxId?: string; taxType?: string; country?: string };
            setPrefs({
                taxInclusivePricing: ws.taxInclusivePricing ?? false,
                taxReporting: ws.taxReporting ?? false,
                taxId: ws.taxId ?? '',
                taxType: ws.taxType ?? '',
                country: ws.country ?? 'GT',
            });
            setTaxIdValue(ws.taxId ?? '');
        }
    }, [activeWorkspace]);

    const togglePref = (key: 'taxInclusivePricing' | 'taxReporting') => {
        setPrefs(p => ({ ...p, [key]: !p[key] }));
    };

    const saveAllPrefs = async () => {
        setSavingPrefs(true);
        try {
            const patch = {
                taxInclusivePricing: prefs.taxInclusivePricing,
                taxReporting: prefs.taxReporting,
                taxId: taxIdValue,
                taxType: taxIdValue ? 'nit' : '',
            };
            await api.patch('/workspaces/current', patch);
            setPrefs(p => ({ ...p, ...patch }));
            setPrefsSaved(true);
            setTimeout(() => setPrefsSaved(false), 2500);
        } finally { setSavingPrefs(false); }
    };

    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (tax: WorkspaceTax) => { setEditing(tax); setModalOpen(true); };

    const handleSave = async (form: typeof emptyForm) => {
        const payload = { ...form, rate: parseFloat(form.rate as string) };
        if (editing) {
            await api.patch(`/workspaces/current/taxes/${editing.id}`, payload);
        } else {
            await api.post('/workspaces/current/taxes', payload);
        }
        await load();
    };

    const toggleActive = async (tax: WorkspaceTax) => {
        setTogglingId(tax.id);
        try { await api.patch(`/workspaces/current/taxes/${tax.id}`, { isActive: !tax.isActive }); await load(); }
        finally { setTogglingId(null); }
    };

    const deleteTax = async (tax: WorkspaceTax) => {
        if (!confirm(`${t('taxes.confirmDeletePre')}${tax.label}${t('taxes.confirmDeletePost')}`)) return;
        setDeletingId(tax.id);
        try { await api.delete(`/workspaces/current/taxes/${tax.id}`); await load(); }
        finally { setDeletingId(null); }
    };

    const countryData = (paisData as Record<string, { taxIdentifiers?: Array<{ key: string; label: string; placeholder: string; description: string; required: boolean }> }>)[prefs.country ?? 'GT'];
    const taxIdentifiers = countryData?.taxIdentifiers ?? [];

    const sectionCls = 'rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden';

    return (
        <div className="px-6 py-6 max-w-3xl">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">
                    {t('taxes.title')}
                </h1>
                <p className="text-[13px] text-gray-500 dark:text-white/50 mt-0.5 leading-snug">
                    {t('taxes.titleDesc')}
                </p>
            </div>

            <div className="space-y-5">

                {/* ── Preferences section ─────────────────────────────── */}
                <div className={sectionCls}>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                        <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white">{t('taxes.taxPrefs')}</h2>
                        <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('taxes.taxPrefsDesc')}</p>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                        {/* Tax Inclusive Pricing */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[13px] font-medium text-gray-800 dark:text-white/80">{t('taxes.inclusivePricing')}</p>
                                <p className="text-[12px] text-gray-500 dark:text-white/45 mt-0.5">{t('taxes.inclusiveDesc')}</p>
                            </div>
                            <Switch
                                checked={prefs.taxInclusivePricing}
                                onCheckedChange={() => togglePref('taxInclusivePricing')}
                                disabled={savingPrefs}
                            />
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-white/[0.05]" />

                        {/* Tax Reporting */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[13px] font-medium text-gray-800 dark:text-white/80">{t('taxes.taxReporting')}</p>
                                <p className="text-[12px] text-gray-500 dark:text-white/45 mt-0.5">{t('taxes.taxReportingDesc')}</p>
                            </div>
                            <Switch
                                checked={prefs.taxReporting}
                                onCheckedChange={() => togglePref('taxReporting')}
                                disabled={savingPrefs}
                            />
                        </div>

                        {/* Tax identifiers (NIT etc.) */}
                        {taxIdentifiers.length > 0 && (
                            <>
                                <div className="h-px bg-gray-100 dark:bg-white/[0.05]" />
                                <div>
                                    <p className="text-[13px] font-medium text-gray-800 dark:text-white/80 mb-0.5">{t('taxes.taxInfo')}</p>
                                    <p className="text-[12px] text-gray-500 dark:text-white/45 mb-3">{t('taxes.taxInfoDesc')}</p>
                                    <div className="space-y-3">
                                        {taxIdentifiers.map((identifier) => (
                                            <div key={identifier.key}>
                                                <label className="block text-[12px] font-medium text-gray-700 dark:text-white/75 mb-1.5">
                                                    {identifier.label}
                                                    {!identifier.required && (
                                                        <span className="text-gray-400 dark:text-white/35 font-normal ml-1">{t('taxes.optional')}</span>
                                                    )}
                                                </label>
                                                <AppInput
                                                    placeholder={identifier.placeholder}
                                                    value={identifier.key === 'nit' ? taxIdValue : ''}
                                                    onChange={(e) => {
                                                        if (identifier.key === 'nit') setTaxIdValue(e.target.value);
                                                    }}
                                                />
                                                <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1">{identifier.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3.5 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-4">
                        {prefsSaved ? (
                            <span className="text-[12px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('taxes.saved')}
                            </span>
                        ) : (
                            <span className="text-[12px] text-gray-400 dark:text-white/35">{t('taxes.savePrompt')}</span>
                        )}
                        <button
                            onClick={saveAllPrefs}
                            disabled={savingPrefs}
                            className="h-9 px-4 rounded-xl text-[13px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white/90 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            {savingPrefs && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {savingPrefs ? t('taxes.saving') : t('taxes.saveChanges')}
                        </button>
                    </div>
                </div>

                {/* ── Tax rates section ────────────────────────────────── */}
                <div className={sectionCls}>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white">{t('taxes.taxRates')}</h2>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('taxes.taxRatesDesc')}</p>
                        </div>
                        <button
                            onClick={openCreate}
                            className="shrink-0 h-8 px-3 rounded-xl text-[12px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white/90 transition flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {t('taxes.add')}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-[13px] text-gray-400 dark:text-white/40 gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('taxes.loading')}
                        </div>
                    ) : taxes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <div className="w-11 h-11 bg-gray-50 dark:bg-white/[0.05] rounded-xl flex items-center justify-center mb-3">
                                <Percent className="w-5 h-5 text-gray-400 dark:text-white/35" />
                            </div>
                            <p className="text-[13px] font-medium text-gray-800 dark:text-white/75 mb-1">{t('taxes.noTaxes')}</p>
                            <p className="text-[12px] text-gray-400 dark:text-white/40 max-w-xs mb-4">{t('taxes.addTaxesInfo')}</p>
                            <button
                                onClick={openCreate}
                                className="text-[12px] font-medium text-gray-700 dark:text-white/60 underline underline-offset-2 hover:no-underline transition"
                            >
                                {t('taxes.addFirst')}
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <th className="text-left px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">{t('taxes.thName')}</th>
                                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">{t('taxes.thRate')}</th>
                                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">{t('taxes.thAppliesTo')}</th>
                                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">{t('taxes.thStatus')}</th>
                                    <th className="px-4 py-2.5 w-16" />
                                </tr>
                            </thead>
                            <tbody>
                                {taxes.map(tax => (
                                    <tr
                                        key={tax.id}
                                        className={`group border-b border-gray-50 dark:border-white/[0.04] last:border-0 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02] ${!tax.isActive ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">{tax.label}</span>
                                                {tax.isDefault && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/30">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        {t('taxes.badgeDefault')}
                                                    </span>
                                                )}
                                            </div>
                                            {tax.description && (
                                                <p className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5 max-w-[240px] truncate">{tax.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono font-semibold text-gray-800 dark:text-white/75">
                                                {(Number(tax.rate) * 100).toFixed(2).replace(/\.00$/, '')}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-500 dark:text-white/45 text-[12px]">
                                            {t(APPLIES_TO_LABELS[tax.appliesTo])}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={tax.isActive}
                                                    onCheckedChange={() => toggleActive(tax)}
                                                    disabled={togglingId === tax.id}
                                                />
                                                <span className={`text-[11px] font-medium ${tax.isActive ? 'text-gray-700 dark:text-white/60' : 'text-gray-400 dark:text-white/30'}`}>
                                                    {tax.isActive ? t('taxes.statusActive') : t('taxes.statusInactive')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition"
                                                    onClick={() => openEdit(tax)}
                                                    title={t('taxes.btnEdit')}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                    onClick={() => deleteTax(tax)}
                                                    disabled={deletingId === tax.id}
                                                    title={t('taxes.btnDelete')}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>

            <TaxModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
        </div>
    );
}
