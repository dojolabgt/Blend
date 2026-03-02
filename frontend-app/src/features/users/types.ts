import { User } from '@/lib/types/api.types';

export interface UpdateProfileDto {
    name?: string;
    email?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    password: string;
}
