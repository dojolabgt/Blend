import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';

// Tipo para un campo individual del schema del brief
export interface BriefSchemaField {
    id?: string;
    type: string;
    label: string;
    required?: boolean;
    options?: string[];
    [key: string]: unknown;
}

export interface BriefTemplate {
    id: string;
    name: string;
    description?: string;
    schema: BriefSchemaField[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBriefTemplatePayload {
    name: string;
    description?: string;
    schema?: BriefSchemaField[];
    isActive?: boolean;
}

interface ApiError {
    response?: { data?: { message?: string } };
    message: string;
}

function getErrorMessage(err: unknown): string {
    const apiErr = err as ApiError;
    return apiErr.response?.data?.message || apiErr.message;
}

export function useBriefTemplates(workspaceId?: string) {
    const { activeWorkspace } = useAuth();
    const [templates, setTemplates] = useState<BriefTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetWorkspaceId = workspaceId || activeWorkspace?.id;

    const fetchTemplates = useCallback(async () => {
        if (!targetWorkspaceId) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(`/workspaces/${targetWorkspaceId}/deals/brief-templates`);
            setTemplates(res.data);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId]);

    const createTemplate = useCallback(async (payload: CreateBriefTemplatePayload) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`/workspaces/${activeWorkspace.id}/deals/brief-templates`, payload);
            const newTemplate = res.data;
            setTemplates(prev => [newTemplate, ...prev]);
            return newTemplate;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace]);

    const updateTemplate = useCallback(async (id: string, payload: Partial<CreateBriefTemplatePayload>) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`/workspaces/${activeWorkspace.id}/deals/brief-templates/${id}`, payload);
            const updated = res.data;
            setTemplates(prev => prev.map(t => t.id === id ? updated : t));
            return updated;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace]);

    return {
        templates,
        isLoading,
        error,
        fetchTemplates,
        createTemplate,
        updateTemplate,
    };
}