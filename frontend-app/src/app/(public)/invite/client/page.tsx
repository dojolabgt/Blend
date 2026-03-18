'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { clientsApi } from '@/features/clients/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InviteData {
    clientName: string;
    email: string;
    workspace: { businessName?: string; logo?: string };
}

type PageState = 'loading' | 'error' | 'form' | 'success';

// ─── Inner component (needs useSearchParams) ──────────────────────────────────

function ClientInviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [pageState, setPageState] = useState<PageState>('loading');
    const [invite, setInvite] = useState<InviteData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load invite on mount
    useEffect(() => {
        if (!token) {
            setErrorMsg('Token de invitación no encontrado.');
            setPageState('error');
            return;
        }

        clientsApi.getInvite(token)
            .then((data) => {
                setInvite(data);
                setPageState('form');
            })
            .catch((err: { response?: { data?: { message?: string } } }) => {
                setErrorMsg(err.response?.data?.message || 'Invitación inválida o expirada.');
                setPageState('error');
            });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldError(null);

        if (password.length < 8) {
            setFieldError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password !== confirm) {
            setFieldError('Las contraseñas no coinciden.');
            return;
        }

        setIsSubmitting(true);
        try {
            await clientsApi.acceptInvite(token!, password);
            setPageState('success');
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string } } };
            setFieldError(apiErr.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────

    if (pageState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────

    if (pageState === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="w-full max-w-sm text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <AlertCircle className="h-7 w-7 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">Invitación no válida</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{errorMsg}</p>
                    <Button variant="outline" className="rounded-full mt-2" onClick={() => router.push('/')}>
                        Ir al inicio
                    </Button>
                </div>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────

    if (pageState === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="w-full max-w-sm text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-7 w-7 text-green-500" />
                        </div>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">¡Cuenta creada!</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Tu cuenta está lista. Inicia sesión con tu email y la contraseña que acabas de crear.
                    </p>
                    <Button
                        className="w-full rounded-full mt-2"
                        onClick={() => router.push(`/login?email=${encodeURIComponent(invite?.email ?? '')}`)}
                    >
                        Iniciar sesión
                    </Button>
                </div>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────

    const logo = invite?.workspace.logo ? getImageUrl(invite.workspace.logo) : null;
    const workspaceName = invite?.workspace.businessName || 'tu freelancer';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-sm space-y-6">

                {/* Workspace branding */}
                <div className="text-center space-y-3">
                    {logo ? (
                        <div className="flex justify-center">
                            <Image
                                src={logo}
                                alt={workspaceName}
                                width={48}
                                height={48}
                                className="rounded-xl object-contain"
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-zinc-400" />
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{workspaceName}</p>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Hola, {invite?.clientName?.split(' ')[0] ?? 'cliente'}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Crea una contraseña para acceder a tu portal de cliente.
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">

                    {/* Email (read-only) */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                        <Input
                            value={invite?.email ?? ''}
                            readOnly
                            className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 cursor-default"
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="rounded-xl pr-10"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(v => !v)}
                                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repite tu contraseña"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="rounded-xl pr-10"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Inline error */}
                        {fieldError && (
                            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.07] border border-red-500/[0.15]">
                                <AlertCircle className="h-4 w-4 text-red-400/70 mt-0.5 shrink-0" />
                                <p className="text-[13px] text-red-400 leading-snug">{fieldError}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl h-11 text-base shadow-sm mt-1"
                        >
                            {isSubmitting
                                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creando cuenta...</>
                                : 'Crear cuenta y acceder'
                            }
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-400">
                    Al crear tu cuenta aceptas los términos de uso del portal de clientes.
                </p>
            </div>
        </div>
    );
}

// ─── Page export (Suspense boundary for useSearchParams) ──────────────────────

export default function ClientInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        }>
            <ClientInviteContent />
        </Suspense>
    );
}
