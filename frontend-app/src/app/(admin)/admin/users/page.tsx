'use client';

import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '@/features/admin/api';
import { User } from '@/lib/types/api.types';
import { WorkspaceMember } from '@/features/workspaces/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Loader2,
    Search,
    MoreHorizontal,
    ShieldOff,
    ShieldCheck,
    Trash2,
    Building2,
    ArrowUpCircle,
    CheckCircle2,
    Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

type UserAction =
    | { type: 'disable'; user: User }
    | { type: 'enable'; user: User }
    | { type: 'delete'; user: User };

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pendingAction, setPendingAction] = useState<UserAction | null>(null);
    const [isActioning, setIsActioning] = useState(false);
    const [workspacesUser, setWorkspacesUser] = useState<User | null>(null);
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await adminApi.getAllUsers();
            setUsers(data);
        } catch {
            toast.error('Error al obtener la lista de usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            u.firstName?.toLowerCase().includes(q) ||
            u.lastName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    }, [users, search]);

    const confirmAction = async () => {
        if (!pendingAction) return;
        setIsActioning(true);
        try {
            const { type, user } = pendingAction;
            if (type === 'disable') {
                await adminApi.setUserActive(user.id, false);
                toast.success(`${user.firstName} ${user.lastName} deshabilitado`);
            } else if (type === 'enable') {
                await adminApi.setUserActive(user.id, true);
                toast.success(`${user.firstName} ${user.lastName} habilitado`);
            } else if (type === 'delete') {
                await adminApi.deleteUser(user.id);
                toast.success(`${user.firstName} ${user.lastName} eliminado`);
            }
            await fetchUsers();
        } catch {
            toast.error('Error al realizar la acción');
        } finally {
            setIsActioning(false);
            setPendingAction(null);
        }
    };

    const handleUpgrade = async (workspaceId: string, plan: 'free' | 'pro' | 'premium') => {
        setIsUpgrading(workspaceId);
        try {
            await adminApi.upgradeWorkspace(workspaceId, plan);
            toast.success(`Plan actualizado a ${plan.toUpperCase()}`);
            const data = await adminApi.getAllUsers();
            setUsers(data);
            // Refresh the workspacesUser modal data
            if (workspacesUser) {
                const updated = data.find(u => u.id === workspacesUser.id);
                if (updated) setWorkspacesUser(updated);
            }
        } catch {
            toast.error('Error al actualizar el plan');
        } finally {
            setIsUpgrading(null);
        }
    };

    const actionLabels: Record<string, { title: string; description: string; confirmLabel: string }> = {
        disable: {
            title: 'Deshabilitar cuenta',
            description: 'El usuario no podrá iniciar sesión hasta que se reactive su cuenta. Sus datos se conservan.',
            confirmLabel: 'Deshabilitar',
        },
        enable: {
            title: 'Habilitar cuenta',
            description: 'Se restaurará el acceso del usuario a la plataforma.',
            confirmLabel: 'Habilitar',
        },
        delete: {
            title: 'Eliminar usuario',
            description: 'Esta acción es permanente e irreversible. El usuario y todos sus datos serán eliminados.',
            confirmLabel: 'Eliminar',
        },
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Usuarios</h1>
                <p className="text-sm text-muted-foreground mt-1">{users.length} usuarios registrados</p>
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o email..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[#111111]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-white/40 w-[280px]">Usuario</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-white/40">Rol</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-white/40">Estado</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-white/40">Espacios</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-white/40">Registro</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                    {search ? 'No se encontraron usuarios con ese criterio.' : 'No hay usuarios registrados.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((user) => {
                                const isActive = user.isActive !== false;
                                const wsCount = user.workspaceMembers?.length ?? 0;
                                const initials = ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || user.email[0].toUpperCase();
                                return (
                                    <TableRow
                                        key={user.id}
                                        className={!isActive ? 'opacity-50' : undefined}
                                    >
                                        {/* User */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage src={getImageUrl(user.profileImage)} className="object-cover" />
                                                    <AvatarFallback className="text-[11px] font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate leading-tight">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Role */}
                                        <TableCell>
                                            <Badge
                                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                className="text-[11px] capitalize"
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                                isActive
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {isActive ? 'Activo' : 'Deshabilitado'}
                                            </span>
                                        </TableCell>

                                        {/* Workspaces count */}
                                        <TableCell>
                                            {wsCount > 0 ? (
                                                <button
                                                    onClick={() => setWorkspacesUser(user)}
                                                    className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                >
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-medium">{wsCount}</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    {wsCount > 0 && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => setWorkspacesUser(user)}>
                                                                <Building2 className="h-4 w-4 mr-2" />
                                                                Ver espacios ({wsCount})
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    {isActive ? (
                                                        <DropdownMenuItem
                                                            className="text-amber-600 dark:text-amber-400 focus:text-amber-600 dark:focus:text-amber-400"
                                                            onClick={() => setPendingAction({ type: 'disable', user })}
                                                        >
                                                            <ShieldOff className="h-4 w-4 mr-2" />
                                                            Deshabilitar cuenta
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400"
                                                            onClick={() => setPendingAction({ type: 'enable', user })}
                                                        >
                                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                                            Habilitar cuenta
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                                        onClick={() => setPendingAction({ type: 'delete', user })}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar usuario
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction ? actionLabels[pendingAction.type].title : ''}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction ? actionLabels[pendingAction.type].description : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isActioning}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAction}
                            disabled={isActioning}
                            className={pendingAction?.type === 'delete' ? 'bg-red-600 hover:bg-red-700 text-white' : undefined}
                        >
                            {isActioning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {pendingAction ? actionLabels[pendingAction.type].confirmLabel : ''}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Workspaces Modal */}
            <Dialog open={!!workspacesUser} onOpenChange={(open) => { if (!open) setWorkspacesUser(null); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Espacios de {workspacesUser?.firstName} {workspacesUser?.lastName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto pr-1">
                        {workspacesUser?.workspaceMembers?.map((member: WorkspaceMember) => {
                            const ws = member.workspace;
                            if (!ws) return null;
                            return (
                                <div key={member.id} className="rounded-xl border border-gray-100 dark:border-white/[0.06] p-4 bg-gray-50 dark:bg-white/[0.03]">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Avatar className="h-8 w-8 rounded-lg shrink-0">
                                                <AvatarImage src={getImageUrl(ws.logo)} className="object-cover" />
                                                <AvatarFallback className="rounded-lg text-[11px] font-bold bg-zinc-200 dark:bg-zinc-700">
                                                    {ws.businessName?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{ws.businessName}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={ws.plan === 'free' ? 'secondary' : ws.plan === 'pro' ? 'default' : 'destructive'}
                                            className="shrink-0 text-[11px]"
                                        >
                                            {ws.plan?.toUpperCase()}
                                        </Badge>
                                    </div>

                                    {/* Plan actions */}
                                    <div className="flex gap-2">
                                        {ws.plan === 'premium' ? (
                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Plan máximo
                                            </div>
                                        ) : (
                                            <>
                                                {ws.plan !== 'premium' && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="text-xs h-7"
                                                        disabled={isUpgrading === ws.id}
                                                        onClick={() => handleUpgrade(ws.id, 'premium')}
                                                    >
                                                        {isUpgrading === ws.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ArrowUpCircle className="h-3 w-3 mr-1" />}
                                                        → Premium
                                                    </Button>
                                                )}
                                                {ws.plan === 'free' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs h-7"
                                                        disabled={isUpgrading === ws.id}
                                                        onClick={() => handleUpgrade(ws.id, 'pro')}
                                                    >
                                                        {isUpgrading === ws.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ArrowUpCircle className="h-3 w-3 mr-1" />}
                                                        → Pro
                                                    </Button>
                                                )}
                                                {ws.plan !== 'free' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs h-7 text-muted-foreground"
                                                        disabled={isUpgrading === ws.id}
                                                        onClick={() => handleUpgrade(ws.id, 'free')}
                                                    >
                                                        → Free
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
