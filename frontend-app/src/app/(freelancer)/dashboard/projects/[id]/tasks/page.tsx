'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    closestCorners,
    pointerWithin,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { useProject } from '../layout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { projectsApi, ProjectTask, TaskStatus, CreateTaskPayload } from '@/features/projects/api';
import { TaskCard, TaskCardOverlay } from './_components/TaskCard';
import { TaskSheet } from './_components/TaskSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Column config ─────────────────────────────────────────────────────────────

interface Column {
    id: TaskStatus;
    title: string;
    dotClass: string;
}

const COLUMNS: Column[] = [
    { id: 'todo',        title: 'Por Hacer',      dotClass: 'bg-zinc-400' },
    { id: 'in_progress', title: 'En Progreso',     dotClass: 'bg-blue-500' },
    { id: 'review',      title: 'En Revisión',     dotClass: 'bg-violet-500' },
    { id: 'done',        title: 'Completado',      dotClass: 'bg-emerald-500' },
];

// ─── Droppable column wrapper ──────────────────────────────────────────────────

function KanbanColumn({
    column,
    tasks,
    commentCounts,
    isViewer,
    onTaskClick,
    onAddTask,
}: {
    column: Column;
    tasks: ProjectTask[];
    commentCounts: Record<string, number>;
    isViewer: boolean;
    onTaskClick: (task: ProjectTask) => void;
    onAddTask: (status: TaskStatus) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    return (
        <div className="w-[300px] flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', column.dotClass)} />
                    {column.title}
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full font-normal">
                        {tasks.length}
                    </span>
                </h3>
                {!isViewer && (
                    <button
                        onClick={() => onAddTask(column.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                        title="Agregar tarea"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Cards */}
            <div
                ref={setNodeRef}
                className={cn(
                    'flex-1 rounded-xl border p-2 space-y-2 transition-colors overflow-y-auto',
                    isOver
                        ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20',
                )}
            >
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            commentCount={commentCounts[task.id] ?? 0}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-xs text-zinc-400 dark:text-zinc-600">
                        Sin tareas
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Inline quick-add form ─────────────────────────────────────────────────────

function QuickAddForm({
    status,
    onAdd,
    onCancel,
}: {
    status: TaskStatus;
    onAdd: (title: string, status: TaskStatus) => void;
    onCancel: () => void;
}) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const submit = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onAdd(trimmed, status);
    };

    return (
        <div className="flex items-center gap-2 mt-2 px-1">
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); submit(); }
                    if (e.key === 'Escape') onCancel();
                }}
                placeholder="Título de la tarea..."
                className="text-sm h-8"
            />
            <button
                onClick={submit}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            >
                <Check className="w-4 h-4" />
            </button>
            <button
                onClick={onCancel}
                className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectTasksPage() {
    const { project, isViewer } = useProject();
    const { activeWorkspace } = useAuth();

    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Sheet state
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Quick-add state: which column is open
    const [quickAdd, setQuickAdd] = useState<TaskStatus | null>(null);

    // DnD active task
    const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    // ── Load tasks ────────────────────────────────────────────────────────────

    const loadTasks = useCallback(async () => {
        if (!activeWorkspace) return;
        try {
            const data = await projectsApi.getTasks(activeWorkspace.id, project.id);
            setTasks(data);
        } catch {
            toast.error('No se pudieron cargar las tareas');
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace, project.id]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    // ── Columns map ───────────────────────────────────────────────────────────

    const tasksByColumn = (status: TaskStatus) =>
        tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

    // ── Quick add ─────────────────────────────────────────────────────────────

    const handleQuickAdd = async (title: string, status: TaskStatus) => {
        if (!activeWorkspace) return;
        setQuickAdd(null);
        try {
            const created = await projectsApi.createTask(activeWorkspace.id, project.id, { title, status });
            setTasks((prev) => [...prev, created]);
        } catch {
            toast.error('No se pudo crear la tarea');
        }
    };

    // ── Task sheet ────────────────────────────────────────────────────────────

    const handleTaskClick = (task: ProjectTask) => {
        setSelectedTask(task);
        setSheetOpen(true);
    };

    const handleTaskUpdated = (updated: ProjectTask) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setSelectedTask(updated);
    };

    const handleTaskDeleted = (taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setSheetOpen(false);
        setSelectedTask(null);
    };

    // Called from TaskSheet when comments change so we can update counts
    const handleCommentCountChange = (taskId: string, count: number) => {
        setCommentCounts((prev) => ({ ...prev, [taskId]: count }));
    };

    // ── DnD handlers ──────────────────────────────────────────────────────────

    const handleDragStart = ({ active }: DragStartEvent) => {
        const task = tasks.find((t) => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        // over is a column droppable
        const overColumn = COLUMNS.find((c) => c.id === overId);
        if (overColumn && activeTask.status !== overColumn.id) {
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === activeId ? { ...t, status: overColumn.id } : t,
                ),
            );
            return;
        }

        // over is another task card — move to same column and reorder
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask && overTask.id !== activeId) {
            if (activeTask.status !== overTask.status) {
                setTasks((prev) =>
                    prev.map((t) =>
                        t.id === activeId ? { ...t, status: overTask.status } : t,
                    ),
                );
            }
        }
    };

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveTask(null);
        if (!over || !activeWorkspace) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        // Determine target column
        let targetStatus: TaskStatus = activeTask.status;
        const overColumn = COLUMNS.find((c) => c.id === overId);
        if (overColumn) {
            targetStatus = overColumn.id;
        } else {
            const overTask = tasks.find((t) => t.id === overId);
            if (overTask) targetStatus = overTask.status;
        }

        // Build new order for that column (optimistic state already has correct column)
        const columnTasks = tasks
            .filter((t) => t.status === targetStatus)
            .sort((a, b) => a.position - b.position);

        // Assign evenly spaced positions
        const reordered = columnTasks.map((t, i) => ({
            id: t.id,
            position: (i + 1) * 1000,
            status: targetStatus,
        }));

        // Optimistic update
        setTasks((prev) =>
            prev.map((t) => {
                const r = reordered.find((r) => r.id === t.id);
                return r ? { ...t, position: r.position, status: r.status } : t;
            }),
        );

        try {
            await projectsApi.reorderTasks(activeWorkspace.id, project.id, { tasks: reordered });
        } catch {
            toast.error('No se pudo guardar el orden');
            loadTasks(); // revert
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col h-[calc(100vh-280px)]">
                    {/* Board */}
                    <div className="flex-1 overflow-x-auto pb-4">
                        <div className="flex gap-4 h-full min-w-max">
                            {COLUMNS.map((col) => {
                                const colTasks = tasksByColumn(col.id);
                                return (
                                    <div key={col.id} className="flex flex-col w-[300px] h-full">
                                        <KanbanColumn
                                            column={col}
                                            tasks={colTasks}
                                            commentCounts={commentCounts}
                                            isViewer={isViewer}
                                            onTaskClick={handleTaskClick}
                                            onAddTask={(status) => setQuickAdd(status)}
                                        />
                                        {/* Quick add form under the column */}
                                        {quickAdd === col.id && !isViewer && (
                                            <QuickAddForm
                                                status={col.id}
                                                onAdd={handleQuickAdd}
                                                onCancel={() => setQuickAdd(null)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>

            <TaskSheet
                task={selectedTask}
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onUpdated={handleTaskUpdated}
                onDeleted={handleTaskDeleted}
                onCommentCountChange={handleCommentCountChange}
                project={project}
                isViewer={isViewer}
            />
        </>
    );
}
