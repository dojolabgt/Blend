'use client';

import { useState } from 'react';
import { Mail, Link2, Check, Copy, Loader2, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { clientsApi } from '@/features/clients/api';
import { Client } from '@/features/clients/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'choose' | 'loading' | 'done-email' | 'done-link';

interface Props {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InvitePortalDialog({ client, open, onOpenChange }: Props) {
    const [step, setStep] = useState<Step>('choose');
    const [magicLink, setMagicLink] = useState('');
    const [copied, setCopied] = useState(false);

    const reset = () => {
        setStep('choose');
        setMagicLink('');
        setCopied(false);
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) reset();
        onOpenChange(val);
    };

    const handleChoose = async (method: 'email' | 'link') => {
        if (!client) return;
        setStep('loading');
        try {
            const res = await clientsApi.inviteToPortal(client.id, method === 'email');
            setMagicLink(res.magicLink);
            setStep(method === 'email' ? 'done-email' : 'done-link');
        } catch {
            toast.error('Error al generar el enlace de acceso');
            setStep('choose');
        }
    };

    const handleCopy = async () => {
        if (!magicLink) return;
        await navigator.clipboard.writeText(magicLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!client) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invitar al portal</DialogTitle>
                    <DialogDescription className="truncate">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{client.name}</span>
                        {' '}·{' '}
                        <span>{client.email}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* Choose method */}
                {step === 'choose' && (
                    <div className="mt-2 space-y-3 w-full min-w-0">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            ¿Cómo quieres compartir el acceso al portal?
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full min-w-0">
                            <MethodCard
                                icon={<Mail className="w-5 h-5" />}
                                title="Enviar por email"
                                description={client.email}
                                onClick={() => handleChoose('email')}
                            />
                            <MethodCard
                                icon={<Link2 className="w-5 h-5" />}
                                title="Copiar enlace"
                                description="Compártelo tú mismo"
                                onClick={() => handleChoose('link')}
                            />
                        </div>
                    </div>
                )}

                {/* Loading */}
                {step === 'loading' && (
                    <div className="py-8 flex flex-col items-center gap-3 text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p className="text-sm">Generando enlace de acceso...</p>
                    </div>
                )}

                {/* Email sent */}
                {step === 'done-email' && (
                    <div className="mt-2 space-y-4 w-full min-w-0">
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                    Email enviado
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5 break-all">
                                    Se envió el enlace a <strong>{client.email}</strong>. Válido por 7 días.
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400">
                            También puedes copiar el enlace si quieres compartirlo por otro medio.
                        </p>
                        <LinkRow link={magicLink} copied={copied} onCopy={handleCopy} />
                        <div className="flex justify-between pt-1">
                            <Button variant="ghost" size="sm" onClick={reset}>
                                Reenviar
                            </Button>
                            <Button size="sm" onClick={() => handleOpenChange(false)}>
                                Listo
                            </Button>
                        </div>
                    </div>
                )}

                {/* Link ready */}
                {step === 'done-link' && (
                    <div className="mt-2 space-y-4 w-full min-w-0">
                        <div className="flex items-start gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                                <ExternalLink className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                    Enlace generado
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Válido por 7 días. Compártelo por WhatsApp, Slack o donde prefieras.
                                </p>
                            </div>
                        </div>
                        <LinkRow link={magicLink} copied={copied} onCopy={handleCopy} />
                        <div className="flex justify-between pt-1">
                            <Button variant="ghost" size="sm" onClick={reset}>
                                Regenerar
                            </Button>
                            <Button size="sm" onClick={() => handleOpenChange(false)}>
                                Listo
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function MethodCard({
    icon,
    title,
    description,
    onClick,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex flex-col items-start gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800',
                'p-4 text-left transition-all cursor-pointer min-w-0 overflow-hidden w-full',
                'hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
        >
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                {icon}
            </div>
            <div className="w-full min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug truncate">{description}</p>
            </div>
        </button>
    );
}

function LinkRow({ link, copied, onCopy }: { link: string; copied: boolean; onCopy: () => void }) {
    return (
        <div className="flex items-center gap-2 min-w-0">
            <div className="flex-1 min-w-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2">
                <p className="text-xs text-zinc-500 truncate font-mono w-full">{link}</p>
            </div>
            <Button
                variant="outline"
                size="icon-sm"
                onClick={onCopy}
                className={cn(
                    'shrink-0 transition-colors',
                    copied && 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400',
                )}
            >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
        </div>
    );
}
