export interface UpdateProfileDto {
    name?: string;
    email?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    password: string;
}
