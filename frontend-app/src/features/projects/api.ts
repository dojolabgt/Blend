import api from '@/lib/api';
import { PaginatedResponse, ListQuery, toQueryString } from '@/types/pagination';
import { Project } from '@/hooks/use-projects';

// ─── Task types ───────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskAssigneeWorkspace {
    id: string;
    businessName: string;
    logo?: string | null;
}

export interface TaskAssigneeUser {
    id: string;
    firstName: string;
    lastName: string;
}

export interface ProjectTask {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    position: number;
    dueDate: string | null;
    assigneeWorkspaceId: string | null;
    assigneeWorkspace: TaskAssigneeWorkspace | null;
    assigneeUserId: string | null;
    assigneeUser: TaskAssigneeUser | null;
    createdAt: string;
    updatedAt: string;
}

export interface TaskAssignableUser {
    type: 'user';
    userId: string;
    label: string;
    avatar: string | null;
}

export interface TaskAssignableWorkspace {
    type: 'workspace';
    workspaceId: string;
    label: string;
    avatar: string | null;
}

export interface TaskAssignables {
    team: TaskAssignableUser[];
    collaborators: TaskAssignableWorkspace[];
}

export interface TaskComment {
    id: string;
    taskId: string;
    workspaceId: string;
    workspace: { id: string; businessName: string; logo?: string | null };
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskPayload {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeWorkspaceId?: string;
    assigneeUserId?: string;
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    assigneeWorkspaceId?: string | null;
    assigneeUserId?: string | null;
    position?: number;
}

export interface ReorderPayload {
    tasks: { id: string; position: number; status: TaskStatus }[];
}

export interface CreateProjectPayload {
    name: string;
    description?: string;
    clientId?: string;
    currency?: string;
    budget?: number;
}

export interface UpdateProjectPayload {
    name?: string;
    description?: string;
    status?: string;
    currency?: string;
    budget?: number | null;
}

export const projectsApi = {
    getAll: async (
        workspaceId: string,
        query?: Partial<ListQuery>,
    ): Promise<PaginatedResponse<Project>> => {
        const qs = query ? toQueryString({ page: 1, limit: 20, ...query }) : '';
        return api
            .get(`/workspaces/${workspaceId}/projects${qs ? `?${qs}` : ''}`)
            .then((res) => res.data);
    },

    create: async (workspaceId: string, dto: CreateProjectPayload): Promise<Project> => {
        return api
            .post(`/workspaces/${workspaceId}/projects`, dto)
            .then((res) => res.data);
    },

    update: async (workspaceId: string, projectId: string, dto: UpdateProjectPayload): Promise<Project> => {
        return api
            .patch(`/workspaces/${workspaceId}/projects/${projectId}`, dto)
            .then((res) => res.data);
    },

    createBrief: async (
        workspaceId: string,
        projectId: string,
        dto: { name: string; templateId?: string; responses?: Record<string, unknown> },
    ) => {
        return api
            .post(`/workspaces/${workspaceId}/projects/${projectId}/briefs`, dto)
            .then((res) => res.data);
    },

    updateBrief: async (
        workspaceId: string,
        projectId: string,
        briefId: string,
        dto: { name?: string; responses?: Record<string, unknown>; isCompleted?: boolean },
    ) => {
        return api
            .patch(`/workspaces/${workspaceId}/projects/${projectId}/briefs/${briefId}`, dto)
            .then((res) => res.data);
    },

    deleteBrief: async (workspaceId: string, projectId: string, briefId: string) => {
        return api
            .delete(`/workspaces/${workspaceId}/projects/${projectId}/briefs/${briefId}`)
            .then((res) => res.data);
    },

    enqueuePdfs: async (workspaceId: string, projectId: string): Promise<{ queued: boolean; pendingBriefs: number }> => {
        return api
            .post(`/workspaces/${workspaceId}/projects/${projectId}/enqueue-pdfs`)
            .then((res) => res.data);
    },

    getPaymentPlan: async (workspaceId: string, projectId: string) => {
        return api
            .get(`/workspaces/${workspaceId}/projects/${projectId}/payment-plan`)
            .then((res) => res.data);
    },

    createOrUpdatePaymentPlan: async (
        workspaceId: string,
        projectId: string,
        dto: {
            milestones: { name: string; amount: number; percentage?: number; dueDate?: string; description?: string }[];
            billingCycle?: string;
        },
    ) => {
        return api
            .post(`/workspaces/${workspaceId}/projects/${projectId}/payment-plan`, dto)
            .then((res) => res.data);
    },

    addMilestone: async (
        workspaceId: string,
        projectId: string,
        dto: { name: string; amount: number; percentage?: number; dueDate?: string; description?: string },
    ) => {
        return api
            .post(`/workspaces/${workspaceId}/projects/${projectId}/payment-plan/milestones`, dto)
            .then((res) => res.data);
    },

    updateMilestone: async (
        workspaceId: string,
        projectId: string,
        milestoneId: string,
        dto: { name?: string; amount?: number; status?: string; dueDate?: string },
    ) => {
        return api
            .patch(
                `/workspaces/${workspaceId}/projects/${projectId}/payment-plan/milestones/${milestoneId}`,
                dto,
            )
            .then((res) => res.data);
    },

    deleteMilestone: async (workspaceId: string, projectId: string, milestoneId: string) => {
        return api
            .delete(
                `/workspaces/${workspaceId}/projects/${projectId}/payment-plan/milestones/${milestoneId}`,
            )
            .then((res) => res.data);
    },

    updatePaymentSettings: async (
        workspaceId: string,
        projectId: string,
        dto: { billingCycle?: string },
    ) => {
        return api
            .patch(`/workspaces/${workspaceId}/projects/${projectId}/payment-plan/settings`, dto)
            .then((res) => res.data);
    },

    // ─── Tasks ────────────────────────────────────────────────────────────────

    getTaskAssignables: (workspaceId: string, projectId: string): Promise<TaskAssignables> =>
        api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/assignables`).then((r) => r.data),

    getTasks: (workspaceId: string, projectId: string): Promise<ProjectTask[]> =>
        api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks`).then((r) => r.data),

    createTask: (workspaceId: string, projectId: string, dto: CreateTaskPayload): Promise<ProjectTask> =>
        api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, dto).then((r) => r.data),

    updateTask: (workspaceId: string, projectId: string, taskId: string, dto: UpdateTaskPayload): Promise<ProjectTask> =>
        api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, dto).then((r) => r.data),

    reorderTasks: (workspaceId: string, projectId: string, payload: ReorderPayload): Promise<void> =>
        api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/reorder`, payload).then(() => undefined),

    deleteTask: (workspaceId: string, projectId: string, taskId: string): Promise<void> =>
        api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`).then(() => undefined),

    // ─── Task Comments ────────────────────────────────────────────────────────

    getTaskComments: (workspaceId: string, projectId: string, taskId: string): Promise<TaskComment[]> =>
        api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`).then((r) => r.data),

    createTaskComment: (workspaceId: string, projectId: string, taskId: string, content: string): Promise<TaskComment> =>
        api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, { content }).then((r) => r.data),

    deleteTaskComment: (workspaceId: string, projectId: string, taskId: string, commentId: string): Promise<void> =>
        api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`).then(() => undefined),
};
