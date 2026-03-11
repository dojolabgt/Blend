import { useState, useCallback } from 'react';
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

export function usePaymentPlan(dealId: string, workspaceId?: string) {
    const { activeWorkspace } = useAuth();
    const [plan, setPlan] = useState<PaymentPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetWorkspaceId = workspaceId || activeWorkspace?.id;
    const base = () => `/workspaces/${targetWorkspaceId}/deals/${dealId}/payment-plan`;

    const fetchPaymentPlan = useCallback(async () => {
        if (!targetWorkspaceId || !dealId) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(base());
            setPlan(res.data);
            return res.data;
        } catch (err: any) {
            if (err.response?.status !== 404) {
                setError(err.response?.data?.message || err.message);
            }
            // If 404, it just means no plan exists yet, which is fine
            setPlan(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const createOrUpdatePlan = useCallback(async (payload: CreatePaymentPlanPayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.post(base(), payload);
            setPlan(res.data);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const addMilestone = useCallback(async (payload: CreateMilestonePayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base()}/milestones`, payload);
            setPlan(res.data);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const updateMilestone = useCallback(async (milestoneId: string, payload: UpdateMilestonePayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base()}/milestones/${milestoneId}`, payload);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const deleteMilestone = useCallback(async (milestoneId: string) => {
        if (!targetWorkspaceId) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base()}/milestones/${milestoneId}`);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const addMilestoneSplit = useCallback(async (milestoneId: string, payload: CreateMilestoneSplitPayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.post(`${base()}/milestones/${milestoneId}/splits`, payload);
            // Returns updated milestone
            // Let's just update the local plan by replacing that milestone
            setPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    milestones: prev.milestones.map(m => m.id === milestoneId ? res.data : m),
                };
            });
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const deleteMilestoneSplit = useCallback(async (milestoneId: string, splitId: string) => {
        if (!targetWorkspaceId) return false;
        setIsLoading(true);
        try {
            const res = await api.delete(`${base()}/milestones/${milestoneId}/splits/${splitId}`);
            // Let's update the local plan by replacing that milestone
            setPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    milestones: prev.milestones.map(m => m.id === milestoneId ? res.data : m),
                };
            });
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    return {
        plan,
        paymentPlan: plan,         // alias used by PaymentPlanStep
        setPlan,
        fetchPaymentPlan,
        createOrUpdatePlan,
        createPaymentPlan: createOrUpdatePlan, // alias used by PaymentPlanStep
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
