'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import { AuthInput } from '@/components/common/AuthInput';
import { Building2, MapPin, Briefcase, ChevronRight, Upload, X, Check } from 'lucide-react';
import Image from 'next/image';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import paisData from '@/data/localization/pais.json';

// ─── Use-case categories ───────────────────────────────────────────────────
const USE_CASES = [
    { id: 'audio',       emoji: '🎙️', label: 'Audio / Podcasts' },
    { id: 'video',       emoji: '🎬', label: 'Video' },
    { id: 'foto',        emoji: '📸', label: 'Fotografía' },
    { id: 'redaccion',   emoji: '✍️',  label: 'Redacción' },
    { id: 'desarrollo',  emoji: '💻', label: 'Desarrollo' },
    { id: 'diseno',      emoji: '🎨', label: 'Diseño' },
    { id: 'consultoria', emoji: '📊', label: 'Consultoría' },
    { id: 'marketing',   emoji: '📣', label: 'Marketing' },
    { id: 'educacion',   emoji: '📚', label: 'Educación' },
    { id: 'otro',        emoji: '📦', label: 'Otro' },
];

const STEPS = [
    { icon: Building2, label: 'Tu negocio' },
    { icon: MapPin,    label: 'Ubicación' },
    { icon: Briefcase, label: 'Tu trabajo' },
];

// ─── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <div key={i} className="flex items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                            done   ? 'bg-white' :
                            active ? 'bg-white/[0.1] border border-white/30' :
                                     'bg-white/[0.05] border border-white/[0.1]'
                        }`}>
                            {done
                                ? <Check className="h-3.5 w-3.5 text-gray-900" strokeWidth={3} />
                                : <span className={`text-[11px] font-bold tabular-nums ${active ? 'text-white' : 'text-white/25'}`}>{i + 1}</span>
                            }
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-12 h-px mx-1 transition-all duration-300 ${i < current ? 'bg-white/30' : 'bg-white/[0.08]'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Use case pill ─────────────────────────────────────────────────────────
function UseCasePill({ emoji, label, selected, onClick }: {
    emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all duration-150 select-none ${
                selected
                    ? 'bg-white text-gray-900 border-white shadow-sm'
                    : 'bg-white/[0.05] text-white/50 border-white/[0.1] hover:bg-white/[0.09] hover:text-white/70'
            }`}
        >
            <span>{emoji}</span>
            {label}
        </button>
    );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function OnboardingPage() {
    const { activeWorkspaceId, activeWorkspace, checkAuth } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 0 — Negocio
    const [businessName, setBusinessName] = useState(activeWorkspace?.businessName || '');
    const [logoPreview, setLogoPreview] = useState<string | null>(activeWorkspace?.logo || null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 1 — Ubicación & Moneda
    const [country, setCountry] = useState(activeWorkspace?.country || 'GT');
    const getDefaultCurrency = (countryCode: string) => {
        const countryData = (paisData as Record<string, { defaults?: { currency?: string } }>)[countryCode];
        return countryData?.defaults?.currency || 'USD';
    };
    const [currency, setCurrency] = useState(() => getDefaultCurrency(activeWorkspace?.country || 'GT'));

    // Step 2 — Casos de uso
    const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);

    const TOTAL_STEPS = 3;

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const toggleUseCase = (id: string) => {
        setSelectedUseCases((prev) =>
            prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
        );
    };

    const handleNextStep = () => {
        setError(null);
        if (step === 0 && !businessName.trim()) {
            setError('El nombre de tu negocio es requerido.');
            return;
        }
        setStep((s) => s + 1);
    };

    const handleFinish = async (skip = false) => {
        if (!activeWorkspaceId) return;
        setIsSubmitting(true);
        setError(null);

        try {
            if (logoFile) {
                const formData = new FormData();
                formData.append('file', logoFile);
                await api.post(`/workspaces/current/logo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { currency: _defaultCurrency, ...countryDefaults } =
                (paisData as Record<string, { defaults?: Record<string, unknown> }>)[country]?.defaults || {};

            const currencyMap: Record<string, { name: string; symbol: string }> = {
                GTQ: { name: 'Quetzal guatemalteco',   symbol: 'Q'  },
                USD: { name: 'Dólar estadounidense',   symbol: '$'  },
                EUR: { name: 'Euro',                   symbol: '€'  },
                MXN: { name: 'Peso mexicano',          symbol: '$'  },
                COP: { name: 'Peso colombiano',        symbol: '$'  },
                ARS: { name: 'Peso argentino',         symbol: '$'  },
                CLP: { name: 'Peso chileno',           symbol: '$'  },
                PEN: { name: 'Sol peruano',            symbol: 'S/' },
                BRL: { name: 'Real brasileño',         symbol: 'R$' },
                GBP: { name: 'Libra esterlina',        symbol: '£'  },
            };
            const currencyData = currencyMap[currency] || { name: currency, symbol: currency };

            await api.patch('/workspaces/current', {
                businessName,
                country,
                state: '',
                ...countryDefaults,
                currencies: [{ code: currency, name: currencyData.name, symbol: currencyData.symbol, isDefault: true }],
                useCases: skip ? [] : selectedUseCases,
                onboardingCompleted: true,
            });

            const countryData = (paisData as Record<string, { taxes?: unknown[] }>)[country];
            const countryTaxes = countryData?.taxes ?? [];
            if (countryTaxes.length > 0) {
                await api.post('/workspaces/current/taxes/seed', { taxes: countryTaxes });
            }

            await checkAuth();
            router.push('/dashboard');
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string } } };
            setError(apiErr.response?.data?.message || 'Ocurrió un error. Intenta de nuevo.');
            setIsSubmitting(false);
        }
    };

    const inputClass = "bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/40 focus-visible:ring-white/20 dark:bg-white/[0.06] dark:border-white/[0.12]";
    const selectTriggerClass = "h-12 rounded-xl bg-white/[0.06] border-white/[0.12] text-white focus:ring-1 focus:ring-white/20 [&>span]:text-white/70";
    const selectContentClass = "bg-[#1a1a1a] border-white/[0.1]";
    const selectItemClass = "text-white/60 focus:bg-white/[0.08] focus:text-white data-[highlighted]:bg-white/[0.08] data-[highlighted]:text-white";

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6 font-sans">

            {/* Ambient glow */}
            <div
                className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px]"
                style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.028) 0%, transparent 65%)' }}
            />

            <div className="relative z-10 w-full max-w-[460px]">

                {/* Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center mb-6">
                        <Image src="/HiKrewLogo.png" alt="Hi Krew" width={20} height={20} className="object-contain opacity-80" />
                    </div>
                    <StepIndicator current={step} />
                    <p className="text-[11px] text-white/25 mt-3">Paso {step + 1} de {TOTAL_STEPS}</p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8">

                    {/* ── Step 0: Tu negocio ── */}
                    {step === 0 && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-[22px] font-black text-white tracking-tight mb-1">Tu negocio</h1>
                                <p className="text-[14px] text-white/40">¿Cómo se llama tu marca o estudio?</p>
                            </div>

                            <AuthInput
                                type="text"
                                placeholder="Nombre de tu negocio"
                                icon={<Building2 className="h-4 w-4" />}
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className={inputClass}
                            />

                            {/* Logo upload */}
                            <div>
                                <p className="text-[13px] font-medium text-white/50 mb-3">
                                    Logo <span className="text-white/25 font-normal">— opcional</span>
                                </p>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-20 h-20 rounded-2xl border border-dashed border-white/[0.15] flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors group overflow-hidden bg-white/[0.03]"
                                >
                                    {logoPreview ? (
                                        <>
                                            <Image src={logoPreview} alt="Logo" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setLogoFile(null); }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5">
                                            <Upload className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
                                            <span className="text-[10px] text-white/25 group-hover:text-white/50 transition-colors">Subir</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Step 1: Ubicación ── */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-[22px] font-black text-white tracking-tight mb-1">¿Dónde estás?</h1>
                                <p className="text-[14px] text-white/40">Configuramos tu zona horaria y moneda automáticamente.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[12px] font-medium text-white/40 block mb-1.5 uppercase tracking-wider">País</label>
                                    <Select value={country} onValueChange={(val) => { setCountry(val); setCurrency(getDefaultCurrency(val)); }}>
                                        <SelectTrigger className={selectTriggerClass}>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-white/40 shrink-0" />
                                                <SelectValue placeholder="Selecciona tu país" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={selectContentClass}>
                                            {Object.entries(paisData as Record<string, { name: string }>).map(([code, data]) => (
                                                <SelectItem key={code} value={code} className={selectItemClass}>{data.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-[12px] font-medium text-white/40 block mb-1.5 uppercase tracking-wider">Moneda principal</label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className={selectTriggerClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className={selectContentClass}>
                                            {[
                                                { code: 'GTQ', label: 'Quetzal guatemalteco (GTQ)' },
                                                { code: 'USD', label: 'Dólar estadounidense (USD)' },
                                                { code: 'EUR', label: 'Euro (EUR)' },
                                                { code: 'MXN', label: 'Peso mexicano (MXN)' },
                                                { code: 'COP', label: 'Peso colombiano (COP)' },
                                                { code: 'ARS', label: 'Peso argentino (ARS)' },
                                                { code: 'CLP', label: 'Peso chileno (CLP)' },
                                                { code: 'PEN', label: 'Sol peruano (PEN)' },
                                                { code: 'BRL', label: 'Real brasileño (BRL)' },
                                                { code: 'GBP', label: 'Libra esterlina (GBP)' },
                                            ].map(({ code, label }) => (
                                                <SelectItem key={code} value={code} className={selectItemClass}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Casos de uso ── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-[22px] font-black text-white tracking-tight mb-1">¿Qué tipo de trabajo haces?</h1>
                                <p className="text-[14px] text-white/40">Selecciona todo lo que aplique. Puedes cambiarlo después.</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {USE_CASES.map(({ id, emoji, label }) => (
                                    <UseCasePill
                                        key={id}
                                        emoji={emoji}
                                        label={label}
                                        selected={selectedUseCases.includes(id)}
                                        onClick={() => toggleUseCase(id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-5 p-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-white/[0.06] my-7" />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        {step > 0 ? (
                            <button
                                type="button"
                                onClick={() => setStep((s) => s - 1)}
                                className="text-[13px] text-white/35 hover:text-white/70 transition-colors"
                            >
                                ← Atrás
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-3">
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => handleFinish(true)}
                                    disabled={isSubmitting}
                                    className="text-[13px] text-white/30 hover:text-white/55 transition-colors"
                                >
                                    Omitir
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={step < TOTAL_STEPS - 1 ? handleNextStep : () => handleFinish(false)}
                                disabled={isSubmitting}
                                className="h-10 px-6 rounded-xl bg-white text-gray-900 text-[13px] font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isSubmitting ? 'Guardando...' : step < TOTAL_STEPS - 1 ? (
                                    <>Continuar <ChevronRight className="w-3.5 h-3.5" /></>
                                ) : 'Comenzar →'}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[12px] text-white/40 mt-6">
                    Puedes cambiar todo esto después en tu configuración.
                </p>
            </div>
        </div>
    );
}
