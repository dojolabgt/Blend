import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';

export interface MilestoneSplit {
    id: string;
    milestoneId: string;
    collaboratorWorkspaceId: string;
    percentage?: number;
    amount: number;
    status: string;
    collaboratorWorkspace?: {
        id: string;
        businessName: string;
        logo: string;
    };
}

export interface PaymentMilestone {
    id: string;
    name: string;
    percentage?: number;
    amount: number;
    description?: string;
    dueDate?: string;
    status: string;
    splits?: MilestoneSplit[];
}

export interface PaymentPlan {
    id: string;
    quotationId?: string;
    totalAmount: number;
    milestones: PaymentMilestone[];
}

export interface CreatePaymentPlanPayload {
    quotationId?: string;
    milestones: {
        name: string;
        percentage?: number;
        amount: number;
        description?: string;
        dueDate?: string;
    }[];
}

export interface CreateMilestonePayload {
    name: string;
    percentage?: number;
    amount: number;
    description?: string;
    dueDate?: string;
}

export interface UpdateMilestonePayload extends Partial<CreateMilestonePayload> {
    status?: string;
}

export interface CreateMilestoneSplitPayload {
    collaboratorWorkspaceId: string;
    percentage?: number;
    amount: number;
}

interface ApiError {
    response?: { status?: number; data?: { message?: string } };
    message: string;
}

function getErrorMessage(err: unknown): string {
    const apiErr = err as ApiError;
    return apiErr.response?.data?.message || apiErr.message;
}

function getErrorStatus(err: unknown): number | undefined {
    return (err as ApiError).response?.status;
}

export function usePaymentPlan(dealId: string, workspaceId?: string) {
    const { activeWorkspace } = useAuth();
    const [plan, setPlan] = useState<PaymentPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetWorkspaceId = workspaceId || activeWorkspace?.id;

    const base = useMemo(
        () => `/workspaces/${targetWorkspaceId}/deals/${dealId}/payment-plan`,
        [targetWorkspaceId, dealId],
    );

    const fetchPaymentPlan = useCallback(async () => {
        if (!targetWorkspaceId || !dealId) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(base);
            setPlan(res.data);
            return res.data;
        } catch (err: unknown) {
            if (getErrorStatus(err) !== 404) {
                setError(getErrorMessage(err));
            }
            setPlan(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, base]);

    const createOrUpdatePlan = useCallback(async (payload: CreatePaymentPlanPayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.post(base, payload);
            setPlan(res.data);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    const addMilestone = useCallback(async (payload: CreateMilestonePayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base}/milestones`, payload);
            setPlan(res.data);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    const updateMilestone = useCallback(async (milestoneId: string, payload: UpdateMilestonePayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base}/milestones/${milestoneId}`, payload);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    const deleteMilestone = useCallback(async (milestoneId: string) => {
        if (!targetWorkspaceId) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base}/milestones/${milestoneId}`);
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    const addMilestoneSplit = useCallback(async (milestoneId: string, payload: CreateMilestoneSplitPayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base}/milestones/${milestoneId}/splits`, payload);
            setPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    milestones: prev.milestones.map(m => m.id === milestoneId ? res.data : m),
                };
            });
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    const deleteMilestoneSplit = useCallback(async (milestoneId: string, splitId: string) => {
        if (!targetWorkspaceId) return false;
        setIsLoading(true);
        try {
            const res = await api.delete(`${base}/milestones/${milestoneId}/splits/${splitId}`);
            setPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    milestones: prev.milestones.map(m => m.id === milestoneId ? res.data : m),
                };
            });
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    return {
        plan,
        paymentPlan: plan,
        setPlan,
        fetchPaymentPlan,
        createOrUpdatePlan,
        createPaymentPlan: createOrUpdatePlan,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        addMilestoneSplit,
        deleteMilestoneSplit,
        isLoading,
        error,
        setError,
    };
}