'use client';

import React, { useEffect, useState } from 'react';
import { useNetwork } from '@/hooks/use-network';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, UserPlus, Check, Copy, Network } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { WorkspaceConnection } from '@/features/network/types';

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

    const columns: ColumnDef<WorkspaceConnection>[] = [
        {
            key: 'conexion',
            header: 'Conexión',
            render: (conn) => {
                const partner = conn.inviterWorkspace?.id === activeWorkspace?.id
                    ? conn.inviteeWorkspace
                    : conn.inviterWorkspace;

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm shrink-0">
                            <AvatarImage src={partner?.logo || undefined} alt={partner?.businessName} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {partner?.businessName?.substring(0, 2).toUpperCase() || 'NA'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold group-hover:text-primary transition-colors">
                                {partner?.businessName || 'Desconocido'}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                    Miembro de la Red
                                </span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Estado',
            render: () => (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                    Conectado
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Fecha de Conexión',
            render: (conn) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(conn.createdAt).toLocaleDateString('es-GT')}
                </span>
            ),
        },
    ];

    return (
        <DashboardShell>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tus Conexiones</h1>
                    <p className="text-muted-foreground">Colabora con otros freelancers, agencias y clientes.</p>
                </div>
                <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="relative z-10 rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Conectar
                </Button>
            </div>

            <DataTable
                data={networkData.active}
                columns={columns}
                isLoading={isLoading}
                emptyIcon={<Network className="w-8 h-8" />}
                emptyTitle="Sin conexiones aún"
                emptyDescription="Comparte tu enlace de invitación para empezar a colaborar con otros workspaces."
                emptyAction={
                    <Button variant="outline" className="rounded-full" onClick={() => setIsInviteModalOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invitar Conexión
                    </Button>
                }
            />

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
                                        {isCopied ? <><Check className="w-4 h-4 mr-1.5" /> Copiado</> : <><Copy className="w-4 h-4 mr-1.5" /> Copiar</>}
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

