'use client';

import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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
    Calendar, Flag, User2, Trash2, Send, Loader2, X, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, getImageUrl } from '@/lib/utils';
import { projectsApi, ProjectTask, TaskComment, TaskStatus, TaskPriority, TaskAssignables } from '@/features/projects/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProjectData } from '../../layout';


interface TaskSheetProps {
    task: ProjectTask | null;
    open: boolean;
    onClose: () => void;
    onUpdated: (task: ProjectTask) => void;
    onDeleted: (taskId: string) => void;
    onCommentCountChange?: (taskId: string, count: number) => void;
    project: ProjectData;
    isViewer: boolean;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
    todo: 'Por Hacer',
    in_progress: 'En Progreso',
    review: 'En Revisión',
    done: 'Completado',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'text-blue-500',
    medium: 'text-amber-500',
    high: 'text-red-500',
};

export function TaskSheet({ task, open, onClose, onUpdated, onDeleted, onCommentCountChange, project, isViewer }: TaskSheetProps) {
    const { activeWorkspace } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const workspaceId = activeWorkspace?.id ?? '';
    const [assignables, setAssignables] = useState<TaskAssignables | null>(null);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description ?? '');
            setEditingTitle(false);
            loadComments();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task?.id]);

    useEffect(() => {
        if (!workspaceId) return;
        projectsApi.getTaskAssignables(workspaceId, project.id)
            .then(setAssignables)
            .catch(() => { /* silent */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId, project.id]);

    useEffect(() => {
        if (editingTitle) titleInputRef.current?.focus();
    }, [editingTitle]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const loadComments = async () => {
        if (!task) return;
        setIsLoadingComments(true);
        try {
            const data = await projectsApi.getTaskComments(workspaceId, project.id, task.id);
            setComments(data);
            onCommentCountChange?.(task.id, data.length);
        } catch {
            // silent
        } finally {
            setIsLoadingComments(false);
        }
    };

    const saveField = async (field: Partial<Parameters<typeof projectsApi.updateTask>[3]>) => {
        if (!task) return;
        try {
            const updated = await projectsApi.updateTask(workspaceId, project.id, task.id, field);
            onUpdated(updated);
        } catch {
            toast.error('Error al guardar');
        }
    };

    const saveTitle = async () => {
        if (!task || title.trim() === task.title) { setEditingTitle(false); return; }
        if (!title.trim()) { setTitle(task.title); setEditingTitle(false); return; }
        setIsSavingTitle(true);
        try {
            const updated = await projectsApi.updateTask(workspaceId, project.id, task.id, { title: title.trim() });
            onUpdated(updated);
            setEditingTitle(false);
        } catch {
            toast.error('Error al guardar el título');
            setTitle(task.title);
        } finally {
            setIsSavingTitle(false);
        }
    };

    const saveDescription = async () => {
        if (!task || description === (task.description ?? '')) return;
        await saveField({ description: description || null });
    };

    const sendComment = async () => {
        if (!task || !commentText.trim()) return;
        setIsSendingComment(true);
        try {
            const comment = await projectsApi.createTaskComment(workspaceId, project.id, task.id, commentText.trim());
            setComments((prev) => {
                const next = [...prev, comment];
                onCommentCountChange?.(task.id, next.length);
                return next;
            });
            setCommentText('');
        } catch {
            toast.error('Error al enviar el comentario');
        } finally {
            setIsSendingComment(false);
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!task) return;
        try {
            await projectsApi.deleteTaskComment(workspaceId, project.id, task.id, commentId);
            setComments((prev) => {
                const next = prev.filter((c) => c.id !== commentId);
                onCommentCountChange?.(task.id, next.length);
                return next;
            });
        } catch {
            toast.error('Error al eliminar el comentario');
        }
    };

    const confirmDelete = async () => {
        if (!task) return;
        setIsDeleting(true);
        try {
            await projectsApi.deleteTask(workspaceId, project.id, task.id);
            onDeleted(task.id);
            onClose();
        } catch {
            toast.error('Error al eliminar la tarea');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (!task) return null;

    // Build a composite select value and display info from whichever assignee field is set
    const assigneeValue = task.assigneeUserId
        ? `user:${task.assigneeUserId}`
        : task.assigneeWorkspaceId
        ? `workspace:${task.assigneeWorkspaceId}`
        : 'none';

    const assigneeLabel = task.assigneeUserId
        ? (() => {
            const u = assignables?.team.find((t) => t.userId === task.assigneeUserId);
            return u ? u.label : `${task.assigneeUser?.firstName ?? ''} ${task.assigneeUser?.lastName ?? ''}`.trim();
          })()
        : task.assigneeWorkspaceId
        ? (() => {
            const w = assignables?.collaborators.find((c) => c.workspaceId === task.assigneeWorkspaceId);
            return w ? w.label : (task.assigneeWorkspace?.businessName ?? '');
          })()
        : null;

    const assigneeAvatar = task.assigneeUserId
        ? null
        : task.assigneeWorkspaceId
        ? (assignables?.collaborators.find((c) => c.workspaceId === task.assigneeWorkspaceId)?.avatar ?? task.assigneeWorkspace?.logo ?? null)
        : null;

    const handleAssigneeChange = (v: string) => {
        if (v === 'none') {
            saveField({ assigneeUserId: null, assigneeWorkspaceId: null });
        } else if (v.startsWith('user:')) {
            saveField({ assigneeUserId: v.slice(5), assigneeWorkspaceId: null });
        } else if (v.startsWith('workspace:')) {
            saveField({ assigneeWorkspaceId: v.slice(10), assigneeUserId: null });
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
                <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
                    {/* Header */}
                    <SheetHeader className="px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                        {editingTitle ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={titleInputRef}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={saveTitle}
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false); } }}
                                    className="text-base font-semibold h-8 px-2"
                                    disabled={isSavingTitle}
                                />
                                {isSavingTitle && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
                            </div>
                        ) : (
                            <SheetTitle
                                className={cn('text-left text-base font-semibold leading-snug cursor-text hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded px-1 -mx-1 transition-colors', isViewer && 'cursor-default pointer-events-none')}
                                onClick={() => !isViewer && setEditingTitle(true)}
                            >
                                {task.title}
                            </SheetTitle>
                        )}
                    </SheetHeader>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Meta fields */}
                        <div className="px-5 py-4 space-y-3 border-b border-zinc-100 dark:border-zinc-800">
                            {/* Status */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-24 shrink-0">Estado</span>
                                {isViewer ? (
                                    <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge>
                                ) : (
                                    <Select value={task.status} onValueChange={(v) => saveField({ status: v as TaskStatus })}>
                                        <SelectTrigger className="h-7 text-xs w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                                                <SelectItem key={s} value={s} className="text-xs">{STATUS_LABELS[s]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Priority */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-24 shrink-0">Prioridad</span>
                                {isViewer ? (
                                    <span className={cn('text-xs font-medium flex items-center gap-1', PRIORITY_COLORS[task.priority])}>
                                        <Flag className="h-3 w-3" /> {PRIORITY_LABELS[task.priority]}
                                    </span>
                                ) : (
                                    <Select value={task.priority} onValueChange={(v) => saveField({ priority: v as TaskPriority })}>
                                        <SelectTrigger className="h-7 text-xs w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                                                <SelectItem key={p} value={p} className="text-xs">
                                                    <span className={cn('flex items-center gap-1.5', PRIORITY_COLORS[p])}>
                                                        <Flag className="h-3 w-3" /> {PRIORITY_LABELS[p]}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Due date */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-24 shrink-0">Fecha límite</span>
                                {isViewer ? (
                                    <span className="text-xs">{task.dueDate ? new Date(task.dueDate + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <input
                                            type="date"
                                            value={task.dueDate ?? ''}
                                            onChange={(e) => saveField({ dueDate: e.target.value || null })}
                                            className="text-xs bg-transparent border-0 outline-none text-zinc-700 dark:text-zinc-300 cursor-pointer"
                                        />
                                        {task.dueDate && (
                                            <button onClick={() => saveField({ dueDate: null })} className="text-muted-foreground hover:text-red-500 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Assignee */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-24 shrink-0">Asignado a</span>
                                {isViewer ? (
                                    assigneeLabel ? (
                                        <div className="flex items-center gap-1.5">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={getImageUrl(assigneeAvatar)} />
                                                <AvatarFallback className="text-[9px]">{assigneeLabel.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs">{assigneeLabel}</span>
                                        </div>
                                    ) : <span className="text-xs text-muted-foreground">Sin asignar</span>
                                ) : (
                                    <Select value={assigneeValue} onValueChange={handleAssigneeChange}>
                                        <SelectTrigger className="h-7 text-xs w-48">
                                            <SelectValue placeholder="Sin asignar">
                                                {assigneeLabel ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={getImageUrl(assigneeAvatar)} />
                                                            <AvatarFallback className="text-[8px]">{assigneeLabel.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        {assigneeLabel}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                                        <User2 className="h-3.5 w-3.5" /> Sin asignar
                                                    </span>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" className="text-xs text-muted-foreground">
                                                Sin asignar
                                            </SelectItem>
                                            {/* Owner workspace team members */}
                                            {(assignables?.team ?? []).length > 0 && (
                                                <>
                                                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                        Tu equipo
                                                    </div>
                                                    {(assignables?.team ?? []).map((u) => (
                                                        <SelectItem key={u.userId} value={`user:${u.userId}`} className="text-xs">
                                                            <span className="flex items-center gap-1.5">
                                                                <Avatar className="h-4 w-4">
                                                                    <AvatarImage src={getImageUrl(u.avatar)} />
                                                                    <AvatarFallback className="text-[8px] bg-zinc-200 dark:bg-zinc-700">{u.label.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                {u.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            )}
                                            {/* Project collaborators */}
                                            {(assignables?.collaborators ?? []).length > 0 && (
                                                <>
                                                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                        Colaboradores
                                                    </div>
                                                    {(assignables?.collaborators ?? []).map((c) => (
                                                        <SelectItem key={c.workspaceId} value={`workspace:${c.workspaceId}`} className="text-xs">
                                                            <span className="flex items-center gap-1.5">
                                                                <Avatar className="h-4 w-4">
                                                                    <AvatarImage src={getImageUrl(c.avatar)} />
                                                                    <AvatarFallback className="text-[8px] bg-zinc-200 dark:bg-zinc-700">{c.label.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                {c.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Descripción</p>
                            {isViewer ? (
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                    {task.description || <span className="text-muted-foreground italic">Sin descripción</span>}
                                </p>
                            ) : (
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={saveDescription}
                                    placeholder="Añade una descripción…"
                                    className="text-sm resize-none min-h-[80px] bg-transparent border-zinc-200 dark:border-zinc-700"
                                    rows={3}
                                />
                            )}
                        </div>

                        {/* Comments */}
                        <div className="px-5 py-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" /> Comentarios
                                {comments.length > 0 && <span className="bg-zinc-100 dark:bg-zinc-800 rounded-full px-1.5 py-0.5 text-[10px]">{comments.length}</span>}
                            </p>

                            {isLoadingComments ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {comments.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic text-center py-2">Sin comentarios aún</p>
                                    )}
                                    {comments.map((c) => {
                                        const isOwn = c.workspaceId === workspaceId;
                                        const initials = c.workspace.businessName.substring(0, 2).toUpperCase();
                                        return (
                                            <div key={c.id} className="flex gap-2.5 group">
                                                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                                                    <AvatarImage src={getImageUrl(c.workspace.logo)} />
                                                    <AvatarFallback className="text-[10px] bg-zinc-200 dark:bg-zinc-700">{initials}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2 mb-0.5">
                                                        <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">{c.workspace.businessName}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(c.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                            {' · '}
                                                            {new Date(c.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                                                </div>
                                                {isOwn && !isViewer && (
                                                    <button
                                                        onClick={() => deleteComment(c.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all shrink-0 mt-1"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div ref={commentsEndRef} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comment input */}
                    {!isViewer && (
                        <div className="shrink-0 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <div className="flex gap-2 items-end">
                                <Textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
                                    placeholder="Escribe un comentario… (Enter para enviar)"
                                    className="text-sm resize-none min-h-[38px] max-h-[100px] flex-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                    rows={1}
                                />
                                <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendComment} disabled={isSendingComment || !commentText.trim()}>
                                    {isSendingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Delete */}
                    {!isViewer && (
                        <div className="shrink-0 px-5 pb-5 pt-1">
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-full" onClick={() => setShowDeleteDialog(true)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar tarea
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Eliminar &ldquo;{task.title}&rdquo;? Esta acción no se puede deshacer. Los comentarios también se eliminarán.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
