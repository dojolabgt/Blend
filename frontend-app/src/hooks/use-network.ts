import { useState, useCallback } from 'react';
import { networkApi } from '@/features/network/api/network';
import { WorkspaceConnection, NetworkData } from '@/features/network/types';
import { toast } from 'sonner';

interface ApiError {
    response?: { data?: { message?: string } };
    message: string;
}

function getErrorMessage(err: unknown): string {
    const apiErr = err as ApiError;
    return apiErr.response?.data?.message || apiErr.message;
}

export const useNetwork = () => {
    const [networkData, setNetworkData] = useState<NetworkData>({ active: [], pendingSent: [] });
    const [receivedInvites, setReceivedInvites] = useState<WorkspaceConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchConnections = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await networkApi.getConnections();
            setNetworkData(data);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchReceivedInvites = useCallback(async () => {
        try {
            const data = await networkApi.getReceivedInvites();
            setReceivedInvites(data);
        } catch {
            // Silently fail — not as critical as main connections
        }
    }, []);

    const sendInvite = async (email: string) => {
        setIsLoading(true);
        try {
            await networkApi.inviteConnection(email);
            toast.success(`Se ha enviado una invitación a ${email}`);
            await fetchConnections();
            return true;
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const generateLink = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await networkApi.generateLink();
            toast.success('Enlace de invitación generado');
            return data.token;
        } catch (err: unknown) {
            toast.error(getErrorMessage(err) || 'Error al generar enlace');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const acceptInvite = useCallback(async (token: string) => {
        setIsLoading(true);
        try {
            await networkApi.acceptInvite(token);
            toast.success('La conexión se ha agregado a tu red.');
            await fetchReceivedInvites();
            await fetchConnections();
            return true;
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchReceivedInvites, fetchConnections]);

    const rejectInvite = async (token: string) => {
        setIsLoading(true);
        try {
            await networkApi.rejectInvite(token);
            toast.success('Has rechazado la invitación correctamente.');
            await fetchReceivedInvites();
            return true;
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        networkData,
        receivedInvites,
        isLoading,
        fetchConnections,
        fetchReceivedInvites,
        sendInvite,
        generateLink,
        acceptInvite,
        rejectInvite,
    };
};