'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileForm } from './_components/ProfileForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

export default function ProfilePage() {
    const { activeWorkspace, checkAuth, isLoading } = useAuth();
    const { t } = useWorkspaceSettings();

    return (
        <div className="px-6 py-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">{t('branding.title')}</h1>
                <p className="text-[13px] text-gray-500 dark:text-white/50 mt-0.5">{t('branding.desc')}</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            ) : (
                <ProfileForm
                    initialData={activeWorkspace}
                    onUpdate={() => checkAuth()}
                />
            )}
        </div>
    );
}
