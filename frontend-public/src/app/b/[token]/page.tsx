'use client';

import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ArrowRight, Loader2, CheckCircle2, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';
import { motion } from 'framer-motion';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type SchemaField = {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
    label: string;
    required: boolean;
    description?: string;
    options?: { label: string; value: string }[];
    allowOther?: boolean;
};

const inputCls = "w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white/85 placeholder:text-white/20 focus:outline-none focus:border-white/[0.22] transition-all disabled:opacity-40 backdrop-blur-sm";

export default function PublicBriefPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [briefData, setBriefData] = useState<any>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [otherValues, setOtherValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchBrief = async () => {
            try {
                const res = await fetch(`${apiUrl}/public/briefs/${token}`);
                if (!res.ok) {
                    if (res.status === 404) return notFound();
                    throw new Error();
                }
                const json = await res.json();
                const data = json.data ?? json;
                setBriefData(data);
                if (data.responses) setResponses(data.responses);
            } catch {
                toast.error('No se pudo cargar el formulario');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBrief();
    }, [token]);

    const handleChange = (fieldId: string, value: any) => setResponses(prev => ({ ...prev, [fieldId]: value }));

    const handleOtherChange = (fieldId: string, value: string) => {
        setOtherValues(prev => ({ ...prev, [fieldId]: value }));
        handleChange(fieldId, 'other');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalResponses = { ...responses };
        briefData?.template?.schema?.forEach((field: SchemaField) => {
            if (field.allowOther && finalResponses[field.id] === 'other') {
                finalResponses[field.id] = `Otro: ${otherValues[field.id] || ''}`;
            }
        });
        setIsSubmitting(true);
        try {
            const res = await fetch(`${apiUrl}/public/briefs/${token}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalResponses),
            });
            if (!res.ok) throw new Error();
            setBriefData((prev: any) => ({ ...prev, isCompleted: true }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            toast.error('Ocurrió un error al enviar tus respuestas. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                <p className="text-[13px] text-white/25 font-light">Cargando formulario...</p>
            </div>
        );
    }

    if (!briefData) return null;

    const { template, deal } = briefData;
    const schema: SchemaField[] = template?.schema || [];
    const isCompleted = briefData.isCompleted;
    const workspace = deal?.workspace;
    const isProOrPremium = workspace?.plan === 'pro' || workspace?.plan === 'premium';

    // ── Success ────────────────────────────────────────────────────────────────
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6 text-center">
                {/* Ambient glow */}
                <div className="fixed pointer-events-none" style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '500px', background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 65%)', borderRadius: '50%' }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="relative"
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 mx-auto">
                        <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-3">¡Brief enviado!</h1>
                    <p className="text-white/40 max-w-sm mx-auto text-[14px] leading-relaxed font-light">
                        Tus respuestas para{' '}
                        <strong className="text-white/70 font-semibold">{deal?.name}</strong>{' '}
                        han sido guardadas. El equipo se pondrá en contacto contigo pronto.
                    </p>
                </motion.div>
            </div>
        );
    }

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0d0d0d] font-sans text-white selection:bg-white selection:text-zinc-900">

            {/* Ambient glows */}
            <div className="fixed pointer-events-none" style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '600px', background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.045) 0%, transparent 65%)', borderRadius: '50%' }} />
            <div className="fixed pointer-events-none" style={{ bottom: '0', left: '-5%', width: '600px', height: '500px', background: 'radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.015) 0%, transparent 60%)', borderRadius: '50%' }} />

            <main className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24">

                {/* Sender */}
                <motion.div
                    className="flex items-center gap-3.5 mb-14"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                >
                    {isProOrPremium ? (
                        <>
                            {workspace?.logo ? (
                                <img src={getImageUrl(workspace.logo)} alt={workspace.name} className="h-10 w-auto max-w-[100px] object-contain" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center font-bold text-white text-base shrink-0">
                                    {(workspace?.businessName || workspace?.name || 'B').charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-white/85 text-[14px] leading-tight">{workspace?.businessName || workspace?.name}</p>
                                {workspace?.description && <p className="text-[12px] text-white/35 mt-0.5">{workspace.description}</p>}
                            </div>
                        </>
                    ) : (
                        <>
                            <img src="/HiKrewLogo.png" alt="Hi Krew" className="h-8 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                            <p className="font-semibold text-white/85 text-[14px]">Hi Krew</p>
                        </>
                    )}
                </motion.div>

                {/* Title */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
                >
                    <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase mb-4">
                        Brief del Proyecto
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.1] mb-3">
                        {template?.name || 'Cuestionario de Proyecto'}
                    </h1>
                    <p className="text-white/40 text-[14px] leading-relaxed font-light">
                        Ayúdanos a entender mejor tus necesidades para{' '}
                        <strong className="text-white/65 font-semibold">{deal?.name}</strong>.
                    </p>
                </motion.div>

                {/* Form card */}
                <motion.div
                    className="rounded-3xl border border-white/[0.08] bg-white/[0.03] overflow-hidden backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {/* Card header */}
                    <div className="px-8 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.07] border border-white/[0.08] flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5 text-white/40" />
                            </div>
                            <span className="text-[12px] text-white/35">
                                Para: <strong className="text-white/55 font-semibold">{deal?.workspace?.name || 'la agencia'}</strong>
                            </span>
                        </div>
                        <span className="text-[11px] text-white/20 font-medium">{schema.length} preguntas</span>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                        {schema.map((field, index) => (
                            <div key={field.id} className="space-y-3">
                                <label className="flex text-[14px] font-semibold text-white/80">
                                    <span className="text-white/20 mr-2.5 shrink-0 font-normal tabular-nums">{index + 1}.</span>
                                    {field.label}
                                    {field.required && <span className="text-rose-400/70 ml-1">*</span>}
                                </label>
                                {field.description && (
                                    <p className="text-[12px] text-white/30 ml-7 font-light leading-relaxed">{field.description}</p>
                                )}

                                <div className="ml-7">
                                    {field.type === 'text' && (
                                        <input
                                            value={responses[field.id] || ''}
                                            onChange={e => handleChange(field.id, e.target.value)}
                                            required={field.required}
                                            placeholder="Tu respuesta..."
                                            className={`${inputCls} max-w-lg`}
                                            disabled={isSubmitting}
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <textarea
                                            value={responses[field.id] || ''}
                                            onChange={e => handleChange(field.id, e.target.value)}
                                            required={field.required}
                                            placeholder="Escribe el detalle aquí..."
                                            rows={4}
                                            className={`${inputCls} max-w-lg resize-y`}
                                            disabled={isSubmitting}
                                        />
                                    )}

                                    {field.type === 'radio' && (
                                        <div className="space-y-2.5">
                                            {field.options?.map(opt => (
                                                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${responses[field.id] === opt.value ? 'border-white/70 bg-white/80' : 'border-white/[0.18] group-hover:border-white/40'}`}>
                                                        {responses[field.id] === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                                                    </div>
                                                    <input type="radio" name={field.id} value={opt.value} checked={responses[field.id] === opt.value} onChange={e => handleChange(field.id, e.target.value)} required={field.required && !responses[field.id]} disabled={isSubmitting} className="sr-only" />
                                                    <span className="text-[13px] text-white/50 group-hover:text-white/75 transition-colors">{opt.label}</span>
                                                </label>
                                            ))}
                                            {field.allowOther && (
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-3 cursor-pointer group shrink-0">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${responses[field.id] === 'other' ? 'border-white/70 bg-white/80' : 'border-white/[0.18] group-hover:border-white/40'}`}>
                                                            {responses[field.id] === 'other' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                                                        </div>
                                                        <input type="radio" name={field.id} value="other" checked={responses[field.id] === 'other'} onChange={e => handleChange(field.id, e.target.value)} disabled={isSubmitting} className="sr-only" />
                                                        <span className="text-[13px] text-white/40">Otra:</span>
                                                    </label>
                                                    <input value={otherValues[field.id] || ''} onChange={e => handleOtherChange(field.id, e.target.value)} onFocus={() => handleChange(field.id, 'other')} disabled={isSubmitting} placeholder="Especificar..." className={`${inputCls} max-w-xs`} required={responses[field.id] === 'other'} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {field.type === 'checkbox' && (
                                        <div className="space-y-2.5">
                                            {field.options?.map(opt => {
                                                const checked = (responses[field.id] || []).includes(opt.value);
                                                return (
                                                    <label key={opt.value} className="flex items-start gap-3 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5 ${checked ? 'border-white/70 bg-white/80' : 'border-white/[0.18] group-hover:border-white/40'}`}>
                                                            {checked && <Check className="w-2.5 h-2.5 text-zinc-900" strokeWidth={3} />}
                                                        </div>
                                                        <input type="checkbox" checked={checked} disabled={isSubmitting} onChange={e => { const cur = responses[field.id] || []; handleChange(field.id, e.target.checked ? [...cur, opt.value] : cur.filter((v: string) => v !== opt.value)); }} className="sr-only" />
                                                        <span className="text-[13px] text-white/50 group-hover:text-white/75 transition-colors">{opt.label}</span>
                                                    </label>
                                                );
                                            })}
                                            {field.allowOther && (
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${(responses[field.id] || []).includes('other') ? 'border-white/70 bg-white/80' : 'border-white/[0.18]'}`}>
                                                        {(responses[field.id] || []).includes('other') && <Check className="w-2.5 h-2.5 text-zinc-900" strokeWidth={3} />}
                                                    </div>
                                                    <input type="checkbox" checked={(responses[field.id] || []).includes('other')} disabled={isSubmitting} onChange={e => { const cur = responses[field.id] || []; handleChange(field.id, e.target.checked ? [...cur, 'other'] : cur.filter((v: string) => v !== 'other')); }} className="sr-only" />
                                                    <input value={otherValues[field.id] || ''} onChange={e => { setOtherValues(p => ({ ...p, [field.id]: e.target.value })); const cur = responses[field.id] || []; if (!cur.includes('other')) handleChange(field.id, [...cur, 'other']); }} disabled={isSubmitting} placeholder="Otra opción..." className={`${inputCls} max-w-xs`} required={(responses[field.id] || []).includes('other')} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {field.type === 'select' && (
                                        <div className="max-w-md space-y-3">
                                            <select
                                                value={responses[field.id] || ''}
                                                onChange={e => handleChange(field.id, e.target.value)}
                                                required={field.required}
                                                disabled={isSubmitting}
                                                className={inputCls}
                                            >
                                                <option value="" disabled>Selecciona una opción...</option>
                                                {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                {field.allowOther && <option value="other">Otra opción...</option>}
                                            </select>
                                            {responses[field.id] === 'other' && (
                                                <input value={otherValues[field.id] || ''} onChange={e => setOtherValues(p => ({ ...p, [field.id]: e.target.value }))} placeholder="Especifica tu respuesta..." required className={inputCls} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Submit */}
                        <div className="pt-8 border-t border-white/[0.06] flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 h-11 bg-white hover:bg-gray-100 text-zinc-900 rounded-full font-semibold text-[13px] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                                ) : (
                                    <>Enviar Respuestas <ArrowRight className="w-3.5 h-3.5" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Powered by */}
                <div className="mt-10 flex justify-center">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/15 uppercase tracking-widest">
                        Powered by
                        <img src="/HiKrewLogo.png" alt="Hi Krew" className="h-3.5 object-contain ml-1 opacity-25 hover:opacity-50 transition-opacity" style={{ filter: 'brightness(0) invert(1)' }} />
                    </div>
                </div>
            </main>
        </div>
    );
}
