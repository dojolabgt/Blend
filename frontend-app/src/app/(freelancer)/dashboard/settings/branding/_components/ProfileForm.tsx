'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';

import { Workspace } from '@/features/workspaces/types';
import { workspacesApi } from '@/features/workspaces/api';
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
import { getImageUrl } from '@/lib/utils';
import { AppInput } from '@/components/common/AppInput';

type ProfileFormValues = {
    businessName?: string;
    brandColor?: string;
};

interface ProfileFormProps {
    initialData: Workspace | null;
    onUpdate: (updatedData: Workspace) => void;
}

export function ProfileForm({ initialData, onUpdate }: ProfileFormProps) {
    const { t } = useWorkspaceSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [currentLogoUrl, setCurrentLogoUrl] = useState(initialData?.logo || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profileSchema = z.object({
        businessName: z.string().max(100, t('branding.valNameMax')).optional(),
        brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t('branding.valColorRegex')).optional().or(z.literal('')),
    });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            businessName: initialData?.businessName || '',
            brandColor: initialData?.brandColor || '',
        },
    });

    const businessName = form.watch('businessName') || 'Freelancer';
    const initials = businessName.substring(0, 2).toUpperCase();

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true);
        try {
            const payload: Partial<Workspace> = {};
            if (data.businessName) payload.businessName = data.businessName;
            if (data.brandColor) payload.brandColor = data.brandColor;

            const updatedProfile = await workspacesApi.updateWorkspace(payload);
            toast.success(t('branding.successUpdate'));
            onUpdate(updatedProfile);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(t('branding.errorUpdate'));
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE_MB = 2;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(t('branding.photoErrorSize'));
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploadingLogo(true);
        try {
            const updatedProfile = await workspacesApi.uploadLogo(file);
            setCurrentLogoUrl(updatedProfile.logo ?? '');
            toast.success(t('branding.photoSuccess'));
            onUpdate(updatedProfile);
        } catch (error) {
            console.error('Error uploading logo', error);
            const err = error as { response?: { data?: { message?: string }, status?: number } };
            const backendMsg = err?.response?.data?.message;
            const msg = typeof backendMsg === 'string' ? backendMsg :
                (err?.response?.status === 413 ? t('branding.photoErrorLarge') : t('branding.photoError'));
            toast.error(msg);
        } finally {
            setIsUploadingLogo(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">

            {/* ── Logo ── */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('branding.cardTitleIdentity')}</h3>
                    <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('branding.cardDescIdentity')}</p>
                </div>
                <div className="px-6 py-5">
                    <div className="flex items-center gap-5">
                        {/* Avatar clickable */}
                        <div
                            className="relative group cursor-pointer shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Avatar className="h-16 w-16 rounded-2xl ring-1 ring-gray-200 dark:ring-white/[0.08]">
                                <AvatarImage src={getImageUrl(currentLogoUrl)} alt={businessName} className="object-cover" />
                                <AvatarFallback className="rounded-2xl text-lg font-bold bg-zinc-900 dark:bg-zinc-800 text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                {isUploadingLogo
                                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    : <Camera className="w-4 h-4 text-white" />
                                }
                            </div>
                        </div>

                        {/* Upload text */}
                        <div>
                            <button
                                type="button"
                                disabled={isUploadingLogo}
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[13px] font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-white/70 transition-colors disabled:opacity-40"
                            >
                                {isUploadingLogo ? t('branding.btnUploading') : t('branding.btnChangeLogo')}
                            </button>
                            <p className="text-[11px] text-gray-500 dark:text-white/50 mt-0.5">
                                PNG, JPG o WEBP · Máx. 2 MB
                            </p>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            className="hidden"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                        />
                    </div>
                </div>
            </div>

            {/* ── Detalles de Marca ── */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('branding.cardTitleDetails')}</h3>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('branding.cardDescDetails')}</p>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            <FormField
                                control={form.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[12px] font-medium text-gray-700 dark:text-white/75">
                                            {t('branding.nameLabel')}
                                        </FormLabel>
                                        <FormControl>
                                            <AppInput
                                                placeholder={t('branding.namePlaceholder')}
                                                className="dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[11px] text-gray-400 dark:text-white/50">
                                            {t('branding.nameDesc')}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brandColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[12px] font-medium text-gray-700 dark:text-white/75">
                                            {t('branding.colorLabel')}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.08] shrink-0 w-10 h-10 cursor-pointer hover:scale-105 transition-transform shadow-sm"
                                                    style={{ backgroundColor: field.value || '#000000' }}
                                                    onClick={() => document.getElementById('brand-color-input')?.click()}
                                                >
                                                    <input
                                                        id="brand-color-input"
                                                        type="color"
                                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                        {...field}
                                                        value={field.value || '#000000'}
                                                    />
                                                </div>
                                                <AppInput
                                                    placeholder="#000000"
                                                    className="font-mono uppercase dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.onChange(val && !val.startsWith('#') ? '#' + val : val);
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-[11px] text-gray-400 dark:text-white/50">
                                            {t('branding.colorDesc')}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
                            <p className="text-[11px] text-gray-400 dark:text-white/50">{t('branding.footerNote')}</p>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-semibold hover:bg-gray-700 dark:hover:bg-white/90 transition-colors disabled:opacity-40"
                            >
                                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {isLoading ? t('branding.btnSaving') : t('branding.btnSave')}
                            </button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
