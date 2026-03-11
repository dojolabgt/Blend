'use client';

import React, { useEffect, useState } from 'react';
import { useNetwork } from '@/hooks/use-network';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Loader2, UserPlus, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function NetworkPage() {
    const { activeWorkspace } = useAuth();
    const {
        networkData,
        isLoading,
        fetchConnections,
        generateLink,
    } = useNetwork();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [generatedLinkToken, setGeneratedLinkToken] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const handleGenerateLink = async () => {
        const token = await generateLink();
        if (token) {
            setGeneratedLinkToken(token);
        }
    };

    const handleCopyLink = () => {
        if (!generatedLinkToken) return;
        const link = `${window.location.origin}/invite/connection?token=${generatedLinkToken}`;
        navigator.clipboard.writeText(link);
        toast.success('Enlace copiado al portapapeles');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleCloseModal = () => {
        setIsInviteModalOpen(false);
        setGeneratedLinkToken(null);
    };

    return (
        <DashboardShell>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tus Conexiones</h1>
                    <p className="text-muted-foreground">Colabora con otros freelancers, agencias y clientes.</p>
                </div>
                <Button onClick={() => setIsInviteModalOpen(true)} className="rounded-full px-6 shadow-lg shadow-primary/20">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Conectar
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Active Connections */}
                <Card className="col-span-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                            Red Activa
                        </CardTitle>
                        <CardDescription>
                            Workspaces con los que tienes una conexión establecida para colaborar en proyectos compartidos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && !networkData.active.length ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                            </div>
                        ) : networkData.active.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                    <UserPlus className="h-6 w-6 text-indigo-500" />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Sin conexiones aún</h3>
                                <p className="text-sm text-zinc-500 max-w-sm mt-1">Comparte tu enlace de invitación para empezar a colaborar.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {networkData.active.map((conn) => {
                                    const partner = conn.inviterWorkspace?.id === activeWorkspace?.id 
                                        ? conn.inviteeWorkspace 
                                        : conn.inviterWorkspace;
                                    return (
                                        <div key={conn.id} className="group relative flex flex-col p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300">
                                            <div className="flex items-start justify-between mb-4">
                                                <Avatar className="h-12 w-12 rounded-xl ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                                                    <AvatarImage src={partner?.logo || undefined} alt={partner?.businessName} className="object-cover" />
                                                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                                                        {partner?.businessName?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none shadow-none text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                                                    Conectado
                                                </Badge>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-zinc-900 dark:text-white line-clamp-1">{partner?.businessName}</h3>
                                                <p className="text-xs text-zinc-500 mt-1">Miembro de la Red</p>
                                            </div>
                                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/0 group-hover:ring-indigo-500/10 pointer-events-none transition-all" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            <Dialog open={isInviteModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Invitar Conexión</DialogTitle>
                        <DialogDescription>
                            Envía una invitación a un freelancer o agencia para agregarlo a tu red y colaborar en Deals compartidos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-4 space-y-4 w-full mt-2">
                        {!generatedLinkToken ? (
                            <>
                                <p className="text-sm text-center text-muted-foreground w-4/5">
                                    Genera un enlace y código QR únicos para compartirlos por WhatsApp, Slack o redes sociales.
                                </p>
                                <Button onClick={handleGenerateLink} disabled={isLoading} className="mt-2 text-md">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generar Enlace
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300 w-full">
                                <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
                                    <QRCodeSVG
                                        value={`${window.location.origin}/invite/connection?token=${generatedLinkToken}`}
                                        size={180}
                                        level="Q"
                                        includeMargin={false}
                                        fgColor="#000000"
                                        bgColor="#ffffff"
                                    />
                                </div>
                                <div className="flex gap-2 w-full mt-4">
                                    <Input
                                        readOnly
                                        value={`${window.location.origin}/invite/connection?token=${generatedLinkToken}`}
                                        className="font-mono text-xs text-muted-foreground"
                                    />
                                    <Button variant="secondary" onClick={handleCopyLink} className="w-28 shrink-0">
                                        {isCopied ? <><Check className="w-4 h-4 mr-1.5"/> Copiado</> : <><Copy className="w-4 h-4 mr-1.5"/> Copiar</>}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Las conexiones que escaneen este código o usen el enlace aparecerán en tus Conexiones Activas.
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardShell>
    );
}
