import { useState, useCallback } from 'react';
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

export function useProjects() {
    const { activeWorkspace } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const base = () => `/workspaces/${activeWorkspace?.id}/projects`;

    const fetchProjects = useCallback(async () => {
        if (!activeWorkspace) return;
        setIsLoading(true);
        try {
            const res = await api.get(`${base()}?t=${Date.now()}`);
            setProjects(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const fetchProject = useCallback(async (projectId: string) => {
        if (!activeWorkspace) return null;
        try {
            const res = await api.get(`${base()}/${projectId}?t=${Date.now()}`);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const addCollaborator = useCallback(async (projectId: string, payload: AddProjectCollaboratorPayload) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base()}/${projectId}/collaborators`, payload);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const removeCollaborator = useCallback(async (projectId: string, collaboratorId: string) => {
        if (!activeWorkspace) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base()}/${projectId}/collaborators/${collaboratorId}`);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const addMilestoneSplit = useCallback(async (projectId: string, milestoneId: string, payload: AddMilestoneSplitPayload) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base()}/${projectId}/milestones/${milestoneId}/splits`, payload);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const deleteMilestoneSplit = useCallback(async (projectId: string, milestoneId: string, splitId: string) => {
        if (!activeWorkspace) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base()}/${projectId}/milestones/${milestoneId}/splits/${splitId}`);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

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
