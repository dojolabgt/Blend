'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { usersApi } from '@/features/users/api';
import { getImageUrl } from '@/lib/utils';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppInput } from '@/components/common/AppInput';

const accountSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(100),
    email: z.string().email('Correo electrónico inválido').min(1, 'El correo es obligatorio'),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountDetailsForm() {
    const { user, checkAuth } = useAuth();
    const { t } = useWorkspaceSettings();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE_MB = 2;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(t('personalInfo.photoErrorSize'));
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploadingImage(true);
        try {
            await usersApi.uploadProfileImage(file);
            toast.success(t('personalInfo.photoSuccess'));
            await checkAuth();
        } catch (error) {
            console.error('Error uploading profile image', error);
            const err = error as { response?: { data?: { message?: string }, status?: number } };
            const backendMsg = err?.response?.data?.message;
            const msg = typeof backendMsg === 'string' ? backendMsg :
                (err?.response?.status === 413 ? t('personalInfo.photoErrorLarge') : t('personalInfo.photoError'));
            toast.error(msg);
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (values: AccountFormValues) => {
        setIsSaving(true);
        try {
            await usersApi.updateProfile({
                firstName: values.firstName,
                lastName: values.lastName,
                ...(values.email !== user?.email ? { email: values.email } : {})
            });
            toast.success(t('personalInfo.successSave'));
            await checkAuth();
        } catch (error) {
            console.error('Error updating profile', error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || t('personalInfo.errorSave'));
        } finally {
            setIsSaving(false);
        }
    };

    const initials = ((user?.firstName || user?.email || 'U')[0] + (user?.lastName?.[0] || '')).toUpperCase();
    const currentImage = getImageUrl(user?.profileImage);
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Usuario';

    return (
        <div className="space-y-4">

            {/* ── Foto de Perfil ── */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('personalInfo.photoTitle')}</h3>
                    <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('personalInfo.photoDesc')}</p>
                </div>
                <div className="px-6 py-5">
                    <div className="flex items-center gap-5">
                        {/* Avatar clickable */}
                        <div
                            className="relative group cursor-pointer shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Avatar className="h-16 w-16 rounded-2xl ring-1 ring-gray-200 dark:ring-white/[0.08]">
                                <AvatarImage src={currentImage} alt={fullName} className="object-cover" />
                                <AvatarFallback className="rounded-2xl text-lg font-bold bg-zinc-900 dark:bg-zinc-800 text-white uppercase">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                {isUploadingImage
                                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    : <Camera className="w-4 h-4 text-white" />
                                }
                            </div>
                        </div>

                        {/* Upload text */}
                        <div>
                            <button
                                type="button"
                                disabled={isUploadingImage}
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[13px] font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-white/70 transition-colors disabled:opacity-40"
                            >
                                {isUploadingImage ? t('branding.btnUploading') : t('personalInfo.photoTitle')}
                            </button>
                            <p className="text-[11px] text-gray-500 dark:text-white/50 mt-0.5">
                                PNG, JPG o WEBP · Máx. 2 MB
                            </p>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                        />
                    </div>
                </div>
            </div>

            {/* ── Información Personal ── */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('personalInfo.formTitle')}</h3>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('personalInfo.formDesc')}</p>
                        </div>

                        <div className="px-6 py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[12px] font-medium text-gray-700 dark:text-white/75">
                                                {t('personalInfo.firstNameLabel')}
                                            </FormLabel>
                                            <FormControl>
                                                <AppInput
                                                    placeholder={t('personalInfo.firstNamePlaceholder')}
                                                    className="dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[12px] font-medium text-gray-700 dark:text-white/75">
                                                {t('personalInfo.lastNameLabel')}
                                            </FormLabel>
                                            <FormControl>
                                                <AppInput
                                                    placeholder={t('personalInfo.lastNamePlaceholder')}
                                                    className="dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel className="text-[12px] font-medium text-gray-700 dark:text-white/75">
                                                {t('personalInfo.emailLabel')}
                                            </FormLabel>
                                            <FormControl>
                                                <AppInput
                                                    placeholder={t('personalInfo.emailPlaceholder')}
                                                    type="email"
                                                    className="dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[11px] text-gray-400 dark:text-white/50">
                                                {t('personalInfo.emailDesc')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
                            <p className="text-[11px] text-gray-400 dark:text-white/50">{t('personalInfo.footerNote')}</p>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-semibold hover:bg-gray-700 dark:hover:bg-white/90 transition-colors disabled:opacity-40"
                            >
                                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {isSaving ? t('personalInfo.btnSaving') : t('personalInfo.btnSave')}
                            </button>
                        </div>
                    </div>
                </form>
            </Form>

        </div>
    );
}
