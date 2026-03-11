'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { networkApi } from '@/features/network/api/network';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, ArrowRight, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/features/auth/hooks/useAuth';

function ConnectionInviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const { user, isLoading: isAuthLoading } = useAuth();
    const [invite, setInvite] = useState<{ inviterName: string; inviterLogo: string; inviteEmail: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setError('Token de invitación no encontrado.');
            setIsLoading(false);
            return;
        }

        const fetchInvite = async () => {
            try {
                const data = await networkApi.getPublicInvite(token);
                setInvite(data);
            } catch (err: unknown) {
                const apiErr = err as { response?: { data?: { message?: string } } };
                setError(apiErr.response?.data?.message || 'Invitación inválida o expirada.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvite();
    }, [token]);

    const handleAccept = async () => {
        if (!token) return;

        if (!user) {
            // User is not logged in, redirect to login/register with callback URL
            const callbackUrl = encodeURIComponent(`/invite/connection?token=${token}`);
            router.push(`/login?callbackUrl=${callbackUrl}`);
            return;
        }

        // User is logged in, attempt to accept
        try {
            setIsLoading(true);
            await networkApi.acceptInvite(token);
            router.push('/dashboard/network');
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string } } };
            setError(apiErr.response?.data?.message || 'Error al aceptar la invitación.');
            setIsLoading(false);
        }
    };

    if (isLoading || isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !invite) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
                <Card className="w-full max-w-md shadow-lg border-red-100 dark:border-red-900/30">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl text-red-600 dark:text-red-500">Invitación no válida</CardTitle>
                        <CardDescription className="text-base">{error}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button onClick={() => router.push('/')} variant="outline">Ir al inicio</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Invitación de conexión</h1>
                    <p className="text-muted-foreground">Te han invitado a colaborar en proyectos compartidos.</p>
                </div>

                <Card className="shadow-lg border-gray-200/60 dark:border-gray-800">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <Avatar className="h-20 w-20 border-4 border-white dark:border-zinc-900 shadow-sm">
                                    <AvatarImage src={invite.inviterLogo} alt={invite.inviterName} />
                                    <AvatarFallback className="text-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                        {invite.inviterName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5 shadow-sm border-2 border-white dark:border-zinc-900">
                                    <UserPlus className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-xl">{invite.inviterName}</CardTitle>
                        <CardDescription className="text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                            quiere conectarse contigo. Esto les permitirá trabajar juntos en propuestas y contratos.
                        </CardDescription>
                    </CardHeader>
                    {invite.inviteEmail && (
                        <CardContent className="bg-gray-50/50 dark:bg-zinc-900/50 py-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Enviado a:</p>
                            <p className="font-medium truncate px-4">{invite.inviteEmail}</p>
                        </CardContent>
                    )}
                    <CardFooter className="flex flex-col gap-3 py-6 relative">
                        {!user ? (
                            <div className="flex flex-col gap-2 w-full">
                                <Button onClick={handleAccept} size="lg" className="w-full shadow-sm">
                                    Iniciar sesión para aceptar <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    ¿No tienes cuenta? Serás redirigido para crear una gratis.
                                </p>
                            </div>
                        ) : (
                            <Button onClick={handleAccept} size="lg" className="w-full shadow-sm gap-2">
                                <Check className="h-4 w-4" /> Aceptar Invitación
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default function ConnectionInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        }>
            <ConnectionInviteContent />
        </Suspense>
    );
}
