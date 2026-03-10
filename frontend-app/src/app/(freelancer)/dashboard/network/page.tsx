'use client';

import React, { useEffect, useState } from 'react';
import { useNetwork } from '@/hooks/use-network';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Check, X, Mails } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function NetworkPage() {
    const {
        networkData,
        receivedInvites,
        isLoading,
        fetchConnections,
        fetchReceivedInvites,
        sendInvite,
        generateLink,
        acceptInvite,
        rejectInvite,
    } = useNetwork();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [generatedLinkToken, setGeneratedLinkToken] = useState<string | null>(null);

    useEffect(() => {
        fetchConnections();
        fetchReceivedInvites();
    }, [fetchConnections, fetchReceivedInvites]);

    const handleSendInvite = async () => {
        if (!inviteEmail) return;
        const success = await sendInvite(inviteEmail);
        if (success) {
            setIsInviteModalOpen(false);
            setInviteEmail('');
        }
    };

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
        // Toast is implied or can be added
    };

    const handleCloseModal = () => {
        setIsInviteModalOpen(false);
        setInviteEmail('');
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
                <Card className="col-span-full border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>Conexiones Activas</CardTitle>
                        <CardDescription>
                            Workspaces con los que actualmente puedes colaborar en Deals compartidos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && !networkData.active.length ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : networkData.active.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <p>Aún no tienes conexiones activas.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {networkData.active.map((conn) => {
                                    // Determine who is who (are we inviter or invitee?)
                                    // Ideally we match our workspace ID, but here we can just show the "other" side
                                    // Wait, networkData.active already populates both.
                                    // We need the active workspace from Auth context to know which is the "other" side
                                    // For now, we'll try to guess based on presence
                                    const partner = conn.inviterWorkspace || conn.inviteeWorkspace;
                                    return (
                                        <div key={conn.id} className="flex items-center space-x-4 rounded-md border p-4 shadow-sm">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={partner?.logo || undefined} alt={partner?.businessName} />
                                                <AvatarFallback>{partner?.businessName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{partner?.businessName}</p>
                                                <p className="text-sm text-muted-foreground mt-1">Conectado</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Received Invites */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Invitaciones Recibidas
                            {receivedInvites.length > 0 && (
                                <Badge variant="secondary">{receivedInvites.length}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Acepta estas invitaciones para colaborar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {receivedInvites.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">No tienes invitaciones pendientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {receivedInvites.map((invite) => (
                                    <div key={invite.id} className="flex flex-col gap-3 rounded-md border p-3 bg-gray-50/50 dark:bg-gray-800/20">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={invite.inviterWorkspace?.logo || undefined} />
                                                <AvatarFallback>{invite.inviterWorkspace?.businessName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col flex-1 truncate">
                                                <span className="text-sm font-semibold truncate">{invite.inviterWorkspace?.businessName}</span>
                                                <span className="text-xs text-muted-foreground truncate">{invite.inviteEmail}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1 border-t">
                                            <Button size="sm" variant="default" className="flex-1 h-8" onClick={() => acceptInvite(invite.token)} disabled={isLoading}>
                                                <Check className="h-4 w-4 mr-1" /> Aceptar
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 h-8 text-red-600 hover:text-red-700" onClick={() => rejectInvite(invite.token)} disabled={isLoading}>
                                                <X className="h-4 w-4 mr-1" /> Rechazar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sent Invites */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>Invitaciones Enviadas</CardTitle>
                        <CardDescription>
                            Invitaciones pendientes de respuesta por parte de tus colaboradores.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {networkData.pendingSent.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">No tienes invitaciones enviadas pendientes.</p>
                        ) : (
                            <div className="rounded-md border">
                                <div className="divide-y">
                                    {networkData.pendingSent.map((invite) => (
                                        <div key={invite.id} className="flex items-center justify-between p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                                                    <Mails className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{invite.inviteEmail}</span>
                                                    <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">Pendiente</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(invite.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
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

                    <Tabs defaultValue="email" className="w-full mt-2">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email">Por Correo</TabsTrigger>
                            <TabsTrigger value="link">Generar Enlace / QR</TabsTrigger>
                        </TabsList>

                        <TabsContent value="email" className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@agencia.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                                <Button onClick={handleSendInvite} disabled={!inviteEmail || isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Enviar Invitación
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="link" className="flex flex-col items-center py-4 space-y-4">
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
                                        <Button variant="secondary" onClick={handleCopyLink}>
                                            Copiar
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Las conexiones que escaneen este código o usen el enlace aparecerán en tus Invitaciones Recibidas o Conexiones Activas.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </DashboardShell>
    );
}
