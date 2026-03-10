import { useState, useCallback } from 'react';
import { networkApi } from '@/features/network/api/network';
import { WorkspaceConnection, NetworkData } from '@/features/network/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const useNetwork = () => {
    const [networkData, setNetworkData] = useState<NetworkData>({ active: [], pendingSent: [] });
    const [receivedInvites, setReceivedInvites] = useState<WorkspaceConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchConnections = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await networkApi.getConnections();
            setNetworkData(data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchReceivedInvites = useCallback(async () => {
        try {
            const data = await networkApi.getReceivedInvites();
            setReceivedInvites(data);
        } catch (err: any) {
            // Silently fail or minimal error, not as critical as main connections
        }
    }, []);

    const sendInvite = async (email: string) => {
        setIsLoading(true);
        try {
            await networkApi.inviteConnection(email);
            toast.success(`Se ha enviado una invitación a ${email}`);
            await fetchConnections();
            return true;
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message);
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
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Error al generar enlace';
            toast.error(msg);
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
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message);
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
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message);
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
