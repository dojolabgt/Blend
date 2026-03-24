import api from '@/lib/api';
import { User } from '@/lib/types/api.types';

export const adminApi = {
    /**
     * Gets all users (Admin only)
     */
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    /**
     * Upgrades a workspace plan manually (Admin only)
     */
    upgradeWorkspace: async (workspaceId: string, plan: 'free' | 'pro' | 'premium'): Promise<{ success: boolean }> => {
        const response = await api.post<{ success: boolean }>(`/admin/workspaces/${workspaceId}/upgrade`, { plan });
        return response.data;
    },

    /**
     * Enables or disables a user account (Admin only)
     */
    setUserActive: async (userId: string, isActive: boolean): Promise<{ isActive: boolean }> => {
        const response = await api.patch<{ isActive: boolean }>(`/admin/users/${userId}/set-active`, { isActive });
        return response.data;
    },

    /**
     * Permanently deletes a user (Admin only)
     */
    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/admin/users/${userId}`);
    },
};
