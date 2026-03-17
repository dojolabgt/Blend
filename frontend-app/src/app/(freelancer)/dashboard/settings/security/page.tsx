'use client';

import { SecurityForm } from './SecurityForm';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { ShieldAlert, Smartphone } from 'lucide-react';

export default function SecurityPage() {
    const { t } = useWorkspaceSettings();

    return (
        <div className="px-6 py-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">{t('security.title')}</h1>
                <p className="text-[13px] text-gray-500 dark:text-white/50 mt-0.5">{t('security.desc')}</p>
            </div>

            <div className="space-y-4">
                <SecurityForm />

                {/* ── 2FA Placeholder ── */}
                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                            <ShieldAlert className="h-4 w-4 text-gray-500 dark:text-white/50" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{t('security.2faTitle')}</h3>
                            <p className="text-[12px] text-gray-500 dark:text-white/50 mt-0.5">{t('security.2faDesc')}</p>
                        </div>
                    </div>
                    <div className="px-6 py-5 space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03]">
                            <Smartphone className="w-5 h-5 text-gray-400 dark:text-white/40 shrink-0" />
                            <span className="text-[13px] font-medium text-gray-600 dark:text-white/60">
                                {t('security.2faApp')}
                            </span>
                        </div>
                        <button
                            disabled
                            className="h-9 px-5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-[13px] font-semibold text-gray-400 dark:text-white/30 cursor-not-allowed"
                        >
                            {t('security.2faBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
