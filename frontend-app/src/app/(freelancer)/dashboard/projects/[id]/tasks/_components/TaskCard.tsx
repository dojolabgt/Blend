'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProjectTask, TaskPriority, TaskStatus } from '@/features/projects/api';
import { cn, getImageUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flag, Calendar, MessageSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
    task: ProjectTask;
    commentCount?: number;
    onClick: () => void;
    isDragOverlay?: boolean;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'text-emerald-500',
    medium: 'text-amber-500',
    high: 'text-red-500',
};

const STATUS_DOT: Record<TaskStatus, string> = {
    todo: 'bg-zinc-400',
    in_progress: 'bg-blue-500',
    review: 'bg-violet-500',
    done: 'bg-emerald-500',
};

export function TaskCard({ task, commentCount = 0, onClick, isDragOverlay = false }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const hasDueDate = !!task.dueDate;
    const dueDateParsed = hasDueDate ? new Date(task.dueDate!) : null;
    const overdue = dueDateParsed && isPast(dueDateParsed) && !isToday(dueDateParsed) && task.status !== 'done';
    const dueToday = dueDateParsed && isToday(dueDateParsed) && task.status !== 'done';

    // Prefer user-level assignee, fall back to workspace-level
    const assigneeLabel = task.assigneeUser
        ? `${task.assigneeUser.firstName} ${task.assigneeUser.lastName}`.trim()
        : task.assigneeWorkspace?.businessName ?? null;
    const assigneeAvatar = task.assigneeUser ? null : task.assigneeWorkspace?.logo ?? null;
    const initials = (assigneeLabel ?? '').slice(0, 2).toUpperCase();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                'group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 cursor-pointer',
                'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all',
                isDragging && 'opacity-40 shadow-lg',
                isDragOverlay && 'shadow-xl rotate-1 opacity-95',
            )}
        >
            {/* Priority indicator — left edge */}
            <div className={cn(
                'absolute left-0 top-3 bottom-3 w-0.5 rounded-full',
                task.priority === 'high' ? 'bg-red-400' :
                task.priority === 'medium' ? 'bg-amber-400' :
                'bg-zinc-200 dark:bg-zinc-700',
            )} />

            <div className="pl-2">
                {/* Title */}
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                    {task.title}
                </p>

                {/* Footer row */}
                <div className="flex items-center justify-between mt-2.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {/* Priority */}
                        <Flag className={cn('w-3 h-3 shrink-0', PRIORITY_COLORS[task.priority])} />

                        {/* Due date */}
                        {hasDueDate && (
                            <span className={cn(
                                'flex items-center gap-1 text-[11px] font-medium rounded px-1.5 py-0.5',
                                overdue
                                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                    : dueToday
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                    : 'text-zinc-400 dark:text-zinc-500',
                            )}>
                                <Calendar className="w-3 h-3" />
                                {format(dueDateParsed!, 'MMM d')}
                            </span>
                        )}

                        {/* Comments */}
                        {commentCount > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                                <MessageSquare className="w-3 h-3" />
                                {commentCount}
                            </span>
                        )}
                    </div>

                    {/* Assignee avatar */}
                    {assigneeLabel && (
                        <Avatar className="w-5 h-5 shrink-0">
                            <AvatarImage src={getImageUrl(assigneeAvatar)} />
                            <AvatarFallback className="text-[9px] bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Ghost card shown in the original position while dragging */
export function TaskCardOverlay({ task }: { task: ProjectTask }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 shadow-xl rotate-1 opacity-95">
            <div className="pl-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                    {task.title}
                </p>
            </div>
        </div>
    );
}
