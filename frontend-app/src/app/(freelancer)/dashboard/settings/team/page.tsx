'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { workspacesApi } from '@/features/workspaces/api';
import type { WorkspaceMemberItem } from '@/features/workspaces/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, UserPlus, Trash2, Sparkles, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PlanLimitError } from '@/lib/plan-limits';
import { useRouter } from 'next/navigation';

const ROLE_LABELS: Record<string, string> = {
    owner: 'Propietario',
    collaborator: 'Colaborador',
    guest: 'Invitado',
    client: 'Cliente',
};

export default function TeamSettingsPage() {
    const { activeWorkspace, activeWorkspaceRole } = useAuth();
    const router = useRouter();
    const isPremium = activeWorkspace?.plan === 'premium';
    const isOwner = activeWorkspaceRole === 'owner';

    const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<WorkspaceMemberItem | null>(null);

    useEffect(() => {
        if (!isPremium) { setLoading(false); return; }
        workspacesApi.getMembers()
            .then(setMembers)
            .catch(() => toast.error('No se pudo cargar el equipo'))
            .finally(() => setLoading(false));
    }, [isPremium]);

    const handleInvite = async () => {
        if (!email.trim()) return;
        setInviting(true);
        try {
            const member = await workspacesApi.inviteMember(email.trim());
            setMembers((prev) => [...prev, member]);
            setEmail('');
            toast.success('Miembro añadido y notificado por correo.');
        } catch (err: unknown) {
            const e = (err as { response?: { data?: PlanLimitError } })?.response?.data;
            if (e?.code === 'PLAN_LIMIT_REACHED' || e?.code === 'FEATURE_NOT_AVAILABLE') {
                window.dispatchEvent(new CustomEvent('plan-limit-reached', { detail: e }));
            } else {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                toast.error(msg ?? 'Error al añadir el miembro');
            }
        } finally {
            setInviting(false);
        }
    };

    const handleRemove = async () => {
        if (!confirmRemove) return;
        setRemovingId(confirmRemove.id);
        setConfirmRemove(null);
        try {
            await workspacesApi.removeMember(confirmRemove.id);
            setMembers((prev) => prev.filter((m) => m.id !== confirmRemove.id));
            toast.success('Miembro eliminado.');
        } catch {
            toast.error('No se pudo eliminar el miembro');
        } finally {
            setRemovingId(null);
        }
    };

    // ── Locked state for non-premium ─────────────────────────────────────────
    if (!isPremium) {
        return (
            <div className="p-8 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Equipo</h1>
                    <p className="text-sm text-zinc-500 mt-1">Gestiona los miembros de tu workspace.</p>
                </div>

                <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 p-8 flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-zinc-900 dark:text-white text-base">Función exclusiva de Premium</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                            Con el plan Premium puedes invitar miembros a tu workspace y construir tu propio equipo.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard/settings/billing')}
                        className="gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0"
                    >
                        <Sparkles className="w-4 h-4" />
                        Ver plan Premium
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-8 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Equipo</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Gestiona los miembros de tu workspace. Los miembros invitados deben tener una cuenta en Hi Krew.
                    </p>
                </div>

                {/* Invite form — owner only */}
                {isOwner && <div className="mb-8">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Invitar por correo</p>
                    <div className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                            className="max-w-xs"
                        />
                        <Button onClick={handleInvite} disabled={inviting || !email.trim()} className="gap-2">
                            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Invitar
                        </Button>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5">
                        El usuario recibirá un correo notificándole que fue añadido al equipo.
                    </p>
                </div>}

                {/* Members list */}
                <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                        Miembros actuales
                        <span className="ml-2 text-xs text-zinc-400 font-normal">({members.length})</span>
                    </p>

                    {loading ? (
                        <div className="flex items-center gap-2 text-zinc-400 text-sm py-4">
                            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                        </div>
                    ) : members.length === 0 ? (
                        <p className="text-sm text-zinc-400 py-4">No hay miembros aún.</p>
                    ) : (
                        <div className="space-y-2">
                            {members.map((member) => {
                                const initials = `${member.user.firstName[0]}${member.user.lastName[0]}`.toUpperCase();
                                const isOwner = member.role === 'owner';
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                    >
                                        <Avatar className="w-9 h-9 shrink-0">
                                            <AvatarFallback className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {member.user.firstName} {member.user.lastName}
                                            </p>
                                            <p className="text-xs text-zinc-400 truncate">{member.user.email}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'text-xs shrink-0',
                                                isOwner && 'border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
                                            )}
                                        >
                                            {ROLE_LABELS[member.role] ?? member.role}
                                        </Badge>
                                        {isOwner && member.role !== 'owner' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-8 h-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                                                onClick={() => setConfirmRemove(member)}
                                                disabled={removingId === member.id}
                                            >
                                                {removingId === member.id
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <Trash2 className="w-3.5 h-3.5" />
                                                }
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm remove dialog */}
            <AlertDialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmRemove && (
                                <>
                                    <strong>{confirmRemove.user.firstName} {confirmRemove.user.lastName}</strong> perderá
                                    acceso al workspace. Esta acción no se puede deshacer.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleRemove}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    );
}
