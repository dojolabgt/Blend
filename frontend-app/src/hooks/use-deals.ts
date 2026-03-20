import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';

export type DealStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'NEGOTIATING' | 'WON' | 'LOST';

export interface CreateDealPayload {
    title: string;
    clientId: string;
    notes?: string;
}

export interface UpdateDealPayload {
    name?: string;
    status?: DealStatus;
    notes?: string;
    briefTemplateId?: string;
    currentStep?: string;
}

export interface AddCollaboratorPayload {
    collaboratorWorkspaceId: string;
    role?: 'viewer' | 'editor';
}

export interface Deal {
    id: string;
    name?: string;
    title?: string;
    slug?: string;
    status?: string | DealStatus;
    createdAt?: string | Date;
    value?: number;
    currency?: string;
    currentStep?: string;
    briefTemplateId?: string;
    notes?: string;
    client?: { id: string; name: string; email?: string; phone?: string;[key: string]: unknown };
    workspace?: { id: string; name?: string; businessName?: string;[key: string]: unknown };
    quotations?: Record<string, unknown>[];
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

export function useDeals() {
    const { activeWorkspace } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const base = useMemo(
        () => `/workspaces/${activeWorkspace?.id}/deals`,
        [activeWorkspace?.id],
    );

    const fetchDeals = useCallback(async () => {
        if (!activeWorkspace) return;
        setIsLoading(true);
        try {
            const res = await api.get(base);
            setDeals(res.data?.data ?? []);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const fetchDeal = useCallback(async (dealId: string) => {
        if (!activeWorkspace) return null;
        try {
            const res = await api.get(`${base}/${dealId}`);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        }
    }, [activeWorkspace, base]);

    const createDeal = useCallback(async (payload: CreateDealPayload) => {
        if (!activeWorkspace) {
            setError('Authentication required');
            return null;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post(base, payload);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const updateDeal = useCallback(async (dealId: string, payload: UpdateDealPayload) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base}/${dealId}`, payload);
            setDeals(prev => prev.map(d => d.id === dealId ? res.data : d));
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const deleteDeal = useCallback(async (dealId: string) => {
        if (!activeWorkspace) return false;
        try {
            await api.delete(`${base}/${dealId}`);
            setDeals(prev => prev.filter(d => d.id !== dealId));
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        }
    }, [activeWorkspace, base]);

    const addCollaborator = useCallback(async (dealId: string, payload: AddCollaboratorPayload) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base}/${dealId}/collaborators`, payload);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const removeCollaborator = useCallback(async (dealId: string, collaboratorId: string) => {
        if (!activeWorkspace) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base}/${dealId}/collaborators/${collaboratorId}`);
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    return {
        deals,
        fetchDeals,
        fetchDeal,
        createDeal,
        updateDeal,
        deleteDeal,
        addCollaborator,
        removeCollaborator,
        isLoading,
        error,
    };
}