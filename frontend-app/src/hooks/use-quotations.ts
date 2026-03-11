import { useState, useCallback, useMemo } from 'react';
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

// Tipo para errores de Axios
interface ApiError {
    response?: { data?: { message?: string } };
    message: string;
}

function getErrorMessage(err: unknown): string {
    const apiErr = err as ApiError;
    return apiErr.response?.data?.message || apiErr.message;
}

export function useQuotations(dealId: string, workspaceId?: string) {
    const { activeWorkspace } = useAuth();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetWorkspaceId = workspaceId || activeWorkspace?.id;

    // useMemo en lugar de función inline → puede entrar en deps de useCallback
    const base = useMemo(
        () => `/workspaces/${targetWorkspaceId}/deals/${dealId}/quotations`,
        [targetWorkspaceId, dealId],
    );

    const fetchQuotations = useCallback(async () => {
        if (!activeWorkspace || !dealId) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(base);
            setQuotations(res.data);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, dealId, base]);

    const createQuotation = useCallback(async (payload: { optionName?: string; description?: string }) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.post(base, payload);
            setQuotations(prev => [...prev, res.data]);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const updateQuotation = useCallback(async (
        quotationId: string,
        payload: { optionName?: string; description?: string; discount?: number; isApproved?: boolean; currency?: string },
    ) => {
        if (!activeWorkspace) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base}/${quotationId}`, payload);
            setQuotations(prev => prev.map(q => q.id === quotationId ? res.data : q));
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace, base]);

    const deleteQuotation = useCallback(async (quotationId: string) => {
        if (!activeWorkspace) return false;
        try {
            await api.delete(`${base}/${quotationId}`);
            setQuotations(prev => prev.filter(q => q.id !== quotationId));
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        }
    }, [activeWorkspace, base]);

    const addItem = useCallback(async (
        quotationId: string,
        payload: Partial<AddQuotationItemPayload> & { serviceId?: string },
    ) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return null;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post(`${base}/${quotationId}/items`, payload);
            setQuotations(prev => prev.map(q => q.id === quotationId ? res.data : q));
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, base]);

    const updateItem = useCallback(async (
        quotationId: string,
        itemId: string,
        payload: UpdateQuotationItemPayload,
    ) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base}/${quotationId}/items/${itemId}`, payload);
            setQuotations(prev => prev.map(q => q.id === quotationId ? res.data : q));
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, base]);

    const deleteItem = useCallback(async (quotationId: string, itemId: string) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base}/${quotationId}/items/${itemId}`);
            await fetchQuotations();
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, dealId, base, fetchQuotations]);

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

    const base = useMemo(
        () => `/workspaces/${targetWorkspaceId}/deals/${dealId}/quotations/${quotationId}/items`,
        [targetWorkspaceId, dealId, quotationId],
    );

    const addItem = useCallback(async (payload: AddQuotationItemPayload) => {
        if (!targetWorkspaceId || !dealId || !quotationId) return null;
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
    }, [targetWorkspaceId, dealId, quotationId, base]);

    const updateItem = useCallback(async (itemId: string, payload: UpdateQuotationItemPayload) => {
        if (!targetWorkspaceId) return null;
        setIsLoading(true);
        try {
            const res = await api.patch(`${base}/${itemId}`, payload);
            return res.data;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    const deleteItem = useCallback(async (itemId: string) => {
        if (!targetWorkspaceId) return false;
        setIsLoading(true);
        try {
            await api.delete(`${base}/${itemId}`);
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [targetWorkspaceId, base]);

    return {
        addItem,
        updateItem,
        deleteItem,
        isLoading,
        error,
        setError,
    };
}