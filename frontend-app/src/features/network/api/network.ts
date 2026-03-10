import api from '@/lib/api';
import { WorkspaceConnection, NetworkData } from '../types';

export const networkApi = {
    // Get connections for the active workspace
    getConnections: async (): Promise<NetworkData> => {
        const { data } = await api.get('/connections');
        return data;
    },

    // Get pending invites received by the user's email globally
    getReceivedInvites: async (): Promise<WorkspaceConnection[]> => {
        const { data } = await api.get('/connections/pending/received');
        return data;
    },

    // Send an invite
    inviteConnection: async (email: string): Promise<WorkspaceConnection> => {
        const { data } = await api.post('/connections/invite', { email });
        return data;
    },

    generateLink: async (): Promise<{ message: string, token: string }> => {
        const { data } = await api.post('/connections/link');
        return data; // Expected { message, token }
    },

    // Public: Get invite info
    getPublicInvite: async (token: string): Promise<{ inviterName: string, inviterLogo: string, inviteEmail: string }> => {
        const { data } = await api.get(`/connections/public/${token}`);
        return data;
    },

    // Accept invite
    acceptInvite: async (token: string): Promise<{ message: string }> => {
        const { data } = await api.post(`/connections/public/${token}/accept`);
        return data;
    },

    // Reject invite
    rejectInvite: async (token: string): Promise<{ message: string }> => {
        const { data } = await api.post(`/connections/public/${token}/reject`);
        return data;
    },
};
