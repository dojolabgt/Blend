'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Globe, Hash, Plus, Trash2, Star, Check, Loader2 } from 'lucide-react';

import { Workspace } from '@/features/workspaces/types';
import { workspacesApi } from '@/features/workspaces/api';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { AppSelect, SelectOption } from '@/components/common/AppSelect';

import paisData from '@/data/localization/pais.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrencyEntry {
    code: string;
    name: string;
    symbol: string;
    isDefault: boolean;
}

// ─── Config Data ──────────────────────────────────────────────────────────────

const LANGUAGES: SelectOption[] = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-419', label: 'Español (Latinoamérica)' },
];

const TIMEZONES: SelectOption[] = [
    { value: 'America/Guatemala', label: 'Guatemala (GMT-6)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Lima', label: 'Lima (GMT-5)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-3)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'America/New_York', label: 'New York, Eastern (GMT-5)' },
    { value: 'America/Chicago', label: 'Chicago, Central (GMT-6)' },
    { value: 'America/Denver', label: 'Denver, Mountain (GMT-7)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles, Pacific (GMT-8)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
];

const DATE_FORMATS: SelectOption[] = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', description: '12/25/2024' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', description: '25/12/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', description: '2024-12-25' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY', description: '25 Dec 2024' },
    { value: 'MMMM DD, YYYY', label: 'MMMM DD, YYYY', description: 'December 25, 2024' },
];

const TIME_FORMATS: SelectOption[] = [
    { value: '12h', label: '12 horas', description: '3:30 PM' },
    { value: '24h', label: '24 horas', description: '15:30' },
];

const NUMBER_FORMATS: SelectOption[] = [
    { value: 'US', label: '1,234.56', description: 'US' },
    { value: 'EU', label: '1.234,56', description: 'Europeo' },
    { value: 'FR', label: '1 234,56', description: 'Francés' },
    { value: 'CH', label: "1'234.56", description: 'Suizo' },
];

const CURRENCY_FORMATS: SelectOption[] = [
    { value: 'symbol-left', label: '$1,234.56' },
    { value: 'symbol-right', label: '1,234.56 $' },
    { value: 'code-left', label: 'USD 1,234.56' },
    { value: 'code-right', label: '1,234.56 USD' },
];

const FIRST_DAY_OPTIONS: SelectOption[] = [
    { value: 'sunday', label: 'Domingo' },
    { value: 'monday', label: 'Lunes' },
    { value: 'saturday', label: 'Sábado' },
];

const ALL_CURRENCIES: CurrencyEntry[] = [
    { code: 'GTQ', name: 'Quetzal guatemalteco', symbol: 'Q', isDefault: false },
    { code: 'USD', name: 'Dólar estadounidense', symbol: '$', isDefault: false },
    { code: 'EUR', name: 'Euro', symbol: '€', isDefault: false },
    { code: 'MXN', name: 'Peso mexicano', symbol: '$', isDefault: false },
    { code: 'GBP', name: 'Libra esterlina', symbol: '£', isDefault: false },
    { code: 'JPY', name: 'Yen japonés', symbol: '¥', isDefault: false },
    { code: 'CAD', name: 'Dólar canadiense', symbol: '$', isDefault: false },
    { code: 'AUD', name: 'Dólar australiano', symbol: '$', isDefault: false },
    { code: 'CHF', name: 'Franco suizo', symbol: 'Fr', isDefault: false },
    { code: 'CNY', name: 'Yuan chino', symbol: '¥', isDefault: false },
    { code: 'BRL', name: 'Real brasileño', symbol: 'R$', isDefault: false },
    { code: 'COP', name: 'Peso colombiano', symbol: '$', isDefault: false },
    { code: 'ARS', name: 'Peso argentino', symbol: '$', isDefault: false },
    { code: 'PEN', name: 'Sol peruano', symbol: 'S/', isDefault: false },
    { code: 'CLP', name: 'Peso chileno', symbol: '$', isDefault: false },
    { code: 'CRC', name: 'Colón costarricense', symbol: '₡', isDefault: false },
    { code: 'HNL', name: 'Lempira hondureño', symbol: 'L', isDefault: false },
    { code: 'NIO', name: 'Córdoba nicaragüense', symbol: 'C$', isDefault: false },
    { code: 'DOP', name: 'Peso dominicano', symbol: 'RD$', isDefault: false },
    { code: 'KRW', name: 'Won surcoreano', symbol: '₩', isDefault: false },
    { code: 'INR', name: 'Rupia india', symbol: '₹', isDefault: false },
    { code: 'SAR', name: 'Riyal saudí', symbol: '﷼', isDefault: false },
    { code: 'AED', name: 'Dírham UAE', symbol: 'د.إ', isDefault: false },
];

// ─── Preview helpers ───────────────────────────────────────────────────────────

function previewDate(fmt: string) {
    const map: Record<string, string> = {
        'MM/DD/YYYY': '12/25/2024', 'DD/MM/YYYY': '25/12/2024',
        'YYYY-MM-DD': '2024-12-25', 'DD MMM YYYY': '25 Dec 2024',
        'MMMM DD, YYYY': 'December 25, 2024',
    };
    return map[fmt] ?? '12/25/2024';
}

function previewTime(fmt: string) { return fmt === '24h' ? '15:30' : '3:30 PM'; }

function previewNumber(fmt: string) {
    const map: Record<string, string> = {
        EU: '1.234,56', FR: '1\u00a0234,56', CH: "1'234.56", US: '1,234.56',
    };
    return map[fmt] ?? '1,234.56';
}

function previewCurrency(fmt: string, numFmt: string) {
    const num = previewNumber(numFmt);
    const map: Record<string, string> = {
        'symbol-right': `${num} $`, 'code-left': `USD ${num}`,
        'code-right': `${num} USD`, 'symbol-left': `$${num}`,
    };
    return map[fmt] ?? `$${num}`;
}

// ─── Schema ────────────────────────────────────────────────────────────────────

type LocalizationFormValues = {
    country: string; language: string; timezone: string;
    firstDayOfWeek: string; dateFormat: string; timeFormat: string;
    numberFormat: string; currencyFormat: string;
};

interface LocalizationFormProps {
    initialData: Workspace | null;
    onUpdate: (updatedData: Workspace) => void;
}

// ─── Select trigger dark override ─────────────────────────────────────────────

const selectClass = 'dark:bg-white/[0.05] dark:border-white/[0.08]';
const labelClass = 'text-[12px] font-medium text-gray-700 dark:text-white/75';
const sectionHeaderClass = 'px-6 py-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2.5';
const iconBoxClass = 'w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0';

// ─── Component ────────────────────────────────────────────────────────────────

export function LocalizationForm({ initialData, onUpdate }: LocalizationFormProps) {
    const { t } = useWorkspaceSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [currencies, setCurrencies] = useState<CurrencyEntry[]>(
        () => (initialData?.currencies ?? []) as CurrencyEntry[]
    );
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('');

    const localizationSchema = z.object({
        country: z.string().min(1, t('localization.valCountryReq')),
        language: z.string().min(1),
        timezone: z.string().min(1),
        firstDayOfWeek: z.string(),
        dateFormat: z.string(),
        timeFormat: z.string(),
        numberFormat: z.string(),
        currencyFormat: z.string(),
    });

    const form = useForm<LocalizationFormValues>({
        resolver: zodResolver(localizationSchema),
        defaultValues: {
            country: initialData?.country || 'GT',
            language: initialData?.language || 'en-US',
            timezone: initialData?.timezone || 'America/Guatemala',
            firstDayOfWeek: initialData?.firstDayOfWeek || 'sunday',
            dateFormat: initialData?.dateFormat || 'MM/DD/YYYY',
            timeFormat: initialData?.timeFormat || '12h',
            numberFormat: initialData?.numberFormat || 'US',
            currencyFormat: initialData?.currencyFormat || 'symbol-left',
        },
    });

    const watchDate = form.watch('dateFormat');
    const watchTime = form.watch('timeFormat');
    const watchNum = form.watch('numberFormat');
    const watchCurr = form.watch('currencyFormat');

    const countryOptions: SelectOption[] = Object.entries(paisData).map(
        ([code, data]: [string, { name: string }]) => ({ value: code, label: data.name })
    );

    const availableCurrencyOptions: SelectOption[] = ALL_CURRENCIES
        .filter(c => !currencies.some(e => e.code === c.code))
        .map(c => ({ value: c.code, label: c.name, description: `${c.code} ${c.symbol}` }));

    function addCurrency() {
        if (!selectedCurrencyCode) return;
        const found = ALL_CURRENCIES.find(c => c.code === selectedCurrencyCode);
        if (!found) return;
        setCurrencies(prev => [...prev, { ...found, isDefault: prev.length === 0 }]);
        setSelectedCurrencyCode('');
    }

    function removeCurrency(code: string) {
        setCurrencies(prev => {
            const next = prev.filter(c => c.code !== code);
            if (prev.find(c => c.code === code)?.isDefault && next.length > 0) next[0].isDefault = true;
            return next;
        });
    }

    function setDefault(code: string) {
        setCurrencies(prev => prev.map(c => ({ ...c, isDefault: c.code === code })));
    }

    async function onSubmit(data: LocalizationFormValues) {
        setIsLoading(true);
        try {
            const updatedProfile = await workspacesApi.updateWorkspace({ ...data, currencies } as Partial<Workspace>);
            toast.success(t('localization.successSave'));
            onUpdate(updatedProfile);
        } catch (error) {
            console.error('Error updating localization:', error);
            toast.error(t('localization.errorSave'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* ── Ubicación ── */}
                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                    <div className={sectionHeaderClass}>
                        <div className={iconBoxClass}>
                            <Globe className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('localization.cardTitleLoc')}</h3>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('localization.cardDescLoc')}</p>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <div className="max-w-xs">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>{t('localization.countryLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                options={countryOptions}
                                                placeholder={t('localization.countryPlaceholder')}
                                                className={selectClass}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Idioma y Región ── */}
                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                    <div className={sectionHeaderClass}>
                        <div className={iconBoxClass}>
                            <Globe className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('localization.cardTitleLang')}</h3>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('localization.cardDescLang')}</p>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>{t('localization.langLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect value={field.value} onValueChange={field.onChange} options={LANGUAGES} className={selectClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="firstDayOfWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>{t('localization.startWeekLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect value={field.value} onValueChange={field.onChange} options={FIRST_DAY_OPTIONS} className={selectClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="timezone"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel className={labelClass}>{t('localization.timezoneLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect value={field.value} onValueChange={field.onChange} options={TIMEZONES} className={selectClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Formatos ── */}
                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                    <div className={sectionHeaderClass}>
                        <div className={iconBoxClass}>
                            <Hash className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('localization.cardTitleFormats')}</h3>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('localization.cardDescFormats')}</p>
                        </div>
                    </div>
                    <div className="px-6 py-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="dateFormat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>{t('localization.dateFormatLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect value={field.value} onValueChange={field.onChange} options={DATE_FORMATS} className={selectClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="timeFormat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>{t('localization.timeFormatLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect value={field.value} onValueChange={field.onChange} options={TIME_FORMATS} className={selectClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="numberFormat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>{t('localization.numberFormatLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect value={field.value} onValueChange={field.onChange} options={NUMBER_FORMATS} className={selectClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currencyFormat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>{t('localization.currencyFormatLabel')}</FormLabel>
                                        <FormControl>
                                            <AppSelect value={field.value} onValueChange={field.onChange} options={CURRENCY_FORMATS} className={selectClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Live preview */}
                        <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">
                                {t('localization.previewTitle')}
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {[
                                    [t('localization.previewDate'), previewDate(watchDate)],
                                    [t('localization.previewTime'), previewTime(watchTime)],
                                    [t('localization.previewNum'), previewNumber(watchNum)],
                                    [t('localization.previewCurr'), previewCurrency(watchCurr, watchNum)],
                                ].map(([label, value]) => (
                                    <React.Fragment key={label}>
                                        <span className="text-[12px] text-gray-500 dark:text-white/50">{label}</span>
                                        <span className="text-[12px] font-semibold text-gray-900 dark:text-white">{value}</span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Monedas ── */}
                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                    <div className={sectionHeaderClass}>
                        <div className={iconBoxClass}>
                            <span className="text-[14px] font-bold text-gray-500 dark:text-white/50">$</span>
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('localization.cardTitleCurrencies')}</h3>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('localization.cardDescCurrencies')}</p>
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {/* Add currency row */}
                        <div className="flex gap-2">
                            <div className="flex-1 max-w-xs">
                                <AppSelect
                                    value={selectedCurrencyCode}
                                    onValueChange={setSelectedCurrencyCode}
                                    options={availableCurrencyOptions}
                                    placeholder={t('localization.addCurrencyPlaceholder')}
                                    className={selectClass}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addCurrency}
                                disabled={!selectedCurrencyCode}
                                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 dark:border-white/[0.08] text-[13px] font-semibold text-gray-700 dark:text-white/75 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {t('localization.btnAdd')}
                            </button>
                        </div>

                        {/* Currency table */}
                        {currencies.length > 0 ? (
                            <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
                                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-500 dark:text-white/40 uppercase">{t('localization.colCode')}</th>
                                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-500 dark:text-white/40 uppercase">{t('localization.colCurrency')}</th>
                                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-500 dark:text-white/40 uppercase">{t('localization.colSymbol')}</th>
                                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold tracking-widest text-gray-500 dark:text-white/40 uppercase">{t('localization.colDefault')}</th>
                                            <th className="px-4 py-2.5" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currencies.map(c => (
                                            <tr
                                                key={c.code}
                                                className={`border-b border-gray-50 dark:border-white/[0.04] last:border-0 transition-colors ${c.isDefault ? 'bg-gray-50 dark:bg-white/[0.03]' : 'hover:bg-gray-50/50 dark:hover:bg-white/[0.02]'}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="font-mono font-bold text-[12px] tracking-wider text-gray-900 dark:text-white">{c.code}</span>
                                                </td>
                                                <td className="px-4 py-3 text-[13px] text-gray-700 dark:text-white/70">{c.name}</td>
                                                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900 dark:text-white">{c.symbol}</td>
                                                <td className="px-4 py-3">
                                                    {c.isDefault ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-1 rounded-full">
                                                            <Check className="w-3 h-3" />
                                                            {t('localization.badgeDefault')}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80 transition-colors"
                                                            onClick={() => setDefault(c.code)}
                                                        >
                                                            <Star className="w-3 h-3" />
                                                            {t('localization.btnSetDefault')}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-lg text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        onClick={() => removeCurrency(c.code)}
                                                        disabled={currencies.length === 1}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/[0.08] p-8 text-center">
                                <p className="text-[13px] text-gray-500 dark:text-white/40">
                                    {t('localization.emptyCurrencies')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
                        <p className="text-[11px] text-gray-500 dark:text-white/50">{t('localization.footerNote')}</p>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-semibold hover:bg-gray-700 dark:hover:bg-white/90 transition-colors disabled:opacity-40"
                        >
                            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {isLoading ? t('localization.btnSaving') : t('localization.btnSave')}
                        </button>
                    </div>
                </div>

            </form>
        </Form>
    );
}
