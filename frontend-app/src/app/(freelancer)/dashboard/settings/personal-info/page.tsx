'use client';

import { AccountDetailsForm } from './_components/AccountDetailsForm';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';

export default function AccountPage() {
    const { t } = useWorkspaceSettings();

    return (
        <div className="px-6 py-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">{t('personalInfo.title')}</h1>
                <p className="text-[13px] text-gray-500 dark:text-white/50 mt-0.5">{t('personalInfo.desc')}</p>
            </div>

            <AccountDetailsForm />
        </div>
    );
}
