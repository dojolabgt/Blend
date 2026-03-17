'use client';

import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LocalizationForm } from './_components/LocalizationForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function LocalizationPage() {
    const { activeWorkspace, checkAuth, isLoading } = useAuth();
    const { t } = useWorkspaceSettings();

    return (
        <div className="px-6 py-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">{t('localization.title')}</h1>
                <p className="text-[13px] text-gray-500 dark:text-white/50 mt-0.5">{t('localization.desc')}</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-2xl dark:bg-white/[0.05]" />
                    <Skeleton className="h-48 w-full rounded-2xl dark:bg-white/[0.05]" />
                    <Skeleton className="h-72 w-full rounded-2xl dark:bg-white/[0.05]" />
                    <Skeleton className="h-56 w-full rounded-2xl dark:bg-white/[0.05]" />
                </div>
            ) : (
                <LocalizationForm
                    initialData={activeWorkspace}
                    onUpdate={() => checkAuth()}
                />
            )}
        </div>
    );
}
