'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

import { workspacesApi } from '@/features/workspaces/api';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

interface RecurrenteFormProps {
    isConfigured: boolean;
    onUpdateStatus: (status: boolean) => void;
}

export function RecurrenteForm({ isConfigured, onUpdateStatus }: RecurrenteFormProps) {
    const { t } = useWorkspaceSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    const recurrenteSchema = z.object({
        publicKey: z.string().min(1, t('recurrente.publicKeyRequired')),
        privateKey: z.string().min(1, t('recurrente.privateKeyRequired')),
    });

    type RecurrenteFormValues = z.infer<typeof recurrenteSchema>;

    const form = useForm<RecurrenteFormValues>({
        resolver: zodResolver(recurrenteSchema),
        defaultValues: { publicKey: '', privateKey: '' },
    });

    async function onSubmit(data: RecurrenteFormValues) {
        setIsLoading(true);
        try {
            await workspacesApi.updateRecurrenteKeys(data);
            toast.success(t('recurrente.successMsg'));
            onUpdateStatus(true);
            form.reset();
        } catch (error) {
            console.error('Error updating keys:', error);
            toast.error(t('recurrente.errorMsg'));
        } finally {
            setIsLoading(false);
        }
    }

    const inputCls = 'w-full h-10 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] px-3.5 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white/30 transition';
    const labelCls = 'block text-[12px] font-medium text-gray-700 dark:text-white/75 mb-1.5';

    return (
        <div className="space-y-5">

            {/* Status banner */}
            {isConfigured ? (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/15 px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">{t('recurrente.connected')}</p>
                        <p className="text-[12px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 leading-snug">{t('recurrente.connectedDesc')}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-3 rounded-xl border border-amber-100 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/15 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">{t('recurrente.missingConfig')}</p>
                        <p className="text-[12px] text-amber-700/70 dark:text-amber-400/70 mt-0.5 leading-snug">{t('recurrente.missingConfigDesc')}</p>
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Public key */}
                <div>
                    <label className={labelCls}>{t('recurrente.publicKeyLabel')}</label>
                    <input
                        className={inputCls}
                        placeholder={t('recurrente.publicKeyPlaceholder')}
                        {...form.register('publicKey')}
                    />
                    {form.formState.errors.publicKey && (
                        <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.publicKey.message}</p>
                    )}
                    <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1.5">{t('recurrente.publicKeyHelp')}</p>
                </div>

                {/* Private/secret key */}
                <div>
                    <label className={labelCls}>{t('recurrente.privateKeyLabel')}</label>
                    <div className="relative">
                        <input
                            type={showSecret ? 'text' : 'password'}
                            className={inputCls + ' pr-10'}
                            placeholder={t('recurrente.privateKeyPlaceholder')}
                            {...form.register('privateKey')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60 transition"
                            tabIndex={-1}
                        >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {form.formState.errors.privateKey && (
                        <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.privateKey.message}</p>
                    )}
                    <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1.5">{t('recurrente.privateKeyHelp')}</p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-4">
                    <p className="text-[11px] text-gray-400 dark:text-white/40 leading-snug">{t('recurrente.saveReminder')}</p>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="shrink-0 h-9 px-4 rounded-xl text-[13px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white/90 disabled:opacity-50 transition flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isLoading ? t('recurrente.saving') : t('recurrente.saveBtn')}
                    </button>
                </div>
            </form>
        </div>
    );
}
