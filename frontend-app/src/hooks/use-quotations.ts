import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';

export interface Quotation {
    id: string;
    optionName: string;
    description?: string;
    currency?: string | null;
    isApproved: boolean;
    subtotal: number;
    discount: number;
    taxTotal: number;
    total: number;
    items: QuotationItem[];
}

export interface QuotationItem {
    id: string;
    serviceId?: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    chargeType: string;
    isTaxable: boolean;
    discount: number;
    subtotal: number;
    unitType?: string;
    internalCost?: number;
}

export interface AddQuotationItemPayload {
    serviceId?: string;
    name: string;
    description?: string;
    price: number;
    quantity?: number;
    chargeType?: 'HOURLY' | 'ONE_TIME' | 'RECURRING';
    isTaxable?: boolean;
    discount?: number;
}

export interface UpdateQuotationItemPayload {
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    chargeType?: 'HOURLY' | 'ONE_TIME' | 'RECURRING';
    isTaxable?: boolean;
    discount?: number;
}

export function useQuotations(dealId: string, workspaceId?: string) {
    const { activeWorkspace } = useAuth();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetWorkspaceId = workspaceId || activeWorkspace?.id;
    const base = () => `/workspaces/${targetWorkspaceId}/deals/${dealId}/quotations`;

    const fetchQuotations = useCallback(async () => {
        if (!activeWorkspace || !dealId) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(base());
            setQuotations(res.data);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, dealId]);

    const createQuotation = useCallback(async (payload: { optionName?: string; description?: string }) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(base(), payload);
            setQuotations(prev => [...prev, res.data]);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, dealId]);

    const updateQuotation = useCallback(async (quotationId: string, payload: { optionName?: string; description?: string; discount?: number; isApproved?: boolean; currency?: string }) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base()}/${quotationId}`, payload);
            setQuotations(prev => prev.map(q => q.id === quotationId ? res.data : q));
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, dealId]);

    const deleteQuotation = useCallback(async (quotationId: string) => {
        if (!activeWorkspace) return false;
        try {
            await api.delete(`${base()}/${quotationId}`);
            setQuotations(prev => prev.filter(q => q.id !== quotationId));
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return false;
        }
    }, [activeWorkspace, dealId]);

    const addItem = useCallback(async (quotationId: string, payload: Partial<AddQuotationItemPayload> & { serviceId?: string }) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return null;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post(
                `/workspaces/${targetWorkspaceId}/deals/${dealId}/quotations/${quotationId}/items`,
                payload,
            );
            // API returns updated Quotation
            setQuotations(prev => prev.map(q => q.id === quotationId ? res.data : q));
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const updateItem = useCallback(async (quotationId: string, itemId: string, payload: UpdateQuotationItemPayload) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(
                `/workspaces/${targetWorkspaceId}/deals/${dealId}/quotations/${quotationId}/items/${itemId}`,
                payload,
            );
            setQuotations(prev => prev.map(q => q.id === quotationId ? res.data : q));
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId]);

    const deleteItem = useCallback(async (quotationId: string, itemId: string) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return false;
        setIsLoading(true);
        try {
            await api.delete(
                `/workspaces/${targetWorkspaceId}/deals/${dealId}/quotations/${quotationId}/items/${itemId}`,
            );
            // Refetch to get updated totals
            await fetchQuotations();
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, fetchQuotations]);

    return {
        quotations,
        setQuotations,
        fetchQuotations,
        createQuotation,
        updateQuotation,
        deleteQuotation,
        addItem,
        updateItem,
        deleteItem,
        isLoading,
        error,
        setError,
    };
}

export function useQuotationItems(dealId: string, quotationId: string, workspaceId?: string) {
    const { activeWorkspace } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetWorkspaceId = workspaceId || activeWorkspace?.id;
    const base = () => `/workspaces/${targetWorkspaceId}/deals/${dealId}/quotations/${quotationId}/items`;

    const addItem = useCallback(async (payload: AddQuotationItemPayload) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return null;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post(base(), payload);
            // Returns updated Quotation
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, quotationId]);

    const updateItem = useCallback(async (itemId: string, payload: UpdateQuotationItemPayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base()}/${itemId}`, payload);
            // Returns updated Quotation
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, quotationId]);

    const deleteItem = useCallback(async (itemId: string) => {
        if (!targetWorkspaceId) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base()}/${itemId}`);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, quotationId]);

    return {
        addItem,
        updateItem,
        deleteItem,
        isLoading,
        error,
        setError,
    };
}
