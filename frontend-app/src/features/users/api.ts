import api from '@/lib/api';
import { User } from '@/lib/types/api.types';
import { UpdateProfileDto, ChangePasswordDto } from './types';

export const usersApi = {
    /**
     * Updates personal user details
     */
    updateProfile: async (data: UpdateProfileDto): Promise<User> => {
        const response = await api.patch<User>('/users/profile', data);
        return response.data;
    },

    /**
     * Changes the user's password
     */
    changePassword: async (data: ChangePasswordDto): Promise<void> => {
        await api.patch<void>('/users/change-password', data);
    },

    /**
     * Uploads the user's personal profile image
     */
    uploadProfileImage: async (file: File): Promise<User> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<User>('/users/profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
