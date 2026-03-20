import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';

export interface AddProjectCollaboratorPayload {
    collaboratorWorkspaceId: string;
    role?: 'viewer' | 'editor';
}

export interface AddMilestoneSplitPayload {
    collaboratorWorkspaceId: string;
    amount: number;
    percentage?: number;
}

export interface Project {
    id: string;
    [key: string]: unknown;
}

interface ApiError {
    response?: { data?: { message?: string } };
    message: string;
}

function getErrorMessage(err: unknown): string {
    const apiErr = err as ApiError;
    return apiErr.response?.data?.message || apiErr.message;
}

export function useProjects() {
    const { activeWorkspace } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const base = useMemo(
        () => `/workspaces/${activeWorkspace?.id}/projects`,
        [activeWorkspace?.id],
    );

    const fetchProjects = useCallback(async () => {
        if (!activeWorkspace) return;
        setIsLoading(true);
        try {
            const res = await api.get(base);
            setProjects(res.data?.data ?? []);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const fetchProject = useCallback(async (projectId: string) => {
        if (!activeWorkspace) return null;
        try {
            const res = await api.get(`${base}/${projectId}`);
            return res.data?.data ?? res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        }
    }, [activeWorkspace, base]);

    const addCollaborator = useCallback(async (projectId: string, payload: AddProjectCollaboratorPayload) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base}/${projectId}/collaborators`, payload);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const removeCollaborator = useCallback(async (projectId: string, collaboratorId: string) => {
        if (!activeWorkspace) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base}/${projectId}/collaborators/${collaboratorId}`);
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const addMilestoneSplit = useCallback(async (projectId: string, milestoneId: string, payload: AddMilestoneSplitPayload) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base}/${projectId}/milestones/${milestoneId}/splits`, payload);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const deleteMilestoneSplit = useCallback(async (projectId: string, milestoneId: string, splitId: string) => {
        if (!activeWorkspace) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base}/${projectId}/milestones/${milestoneId}/splits/${splitId}`);
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    return {
        projects,
        fetchProjects,
        fetchProject,
        addCollaborator,
        removeCollaborator,
        addMilestoneSplit,
        deleteMilestoneSplit,
        isLoading,
        error,
    };
}