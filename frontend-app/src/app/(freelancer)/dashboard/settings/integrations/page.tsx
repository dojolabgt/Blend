'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { workspacesApi } from '@/features/workspaces/api';
import { RecurrenteForm } from '../branding/_components/RecurrenteForm';
import { IntegrationCard } from './_components/IntegrationCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { Gt, Sv } from '@next-languages/flags';

const recurrenteLogoSrc = '/integrations/recurrente-logo.png';

export default function IntegrationsPage() {
    const { t } = useWorkspaceSettings();
    const { activeWorkspace } = useAuth();
    const isProOrPremium = activeWorkspace?.plan === 'pro' || activeWorkspace?.plan === 'premium';
    const workspaceCountry = activeWorkspace?.country || 'GT';
    const isRecurrenteSupported = workspaceCountry === 'GT' || workspaceCountry === 'SV';

    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const statusData = await workspacesApi.getRecurrenteStatus();
                setIsConfigured(statusData.configured);
            } catch (error) {
                console.error('Error loading recurrente status', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="px-6 py-6">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">
                    {t('integrations.title')}
                </h1>
                <p className="text-[13px] text-gray-500 dark:text-white/50 mt-0.5 leading-snug">
                    {t('integrations.titleDesc')}
                </p>
            </div>

            {/* Section label */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20 shrink-0" />
                {t('integrations.availableOptions')}
            </p>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-[200px] w-full rounded-2xl dark:bg-white/[0.05]" />
                        <Skeleton className="h-[200px] w-full rounded-2xl dark:bg-white/[0.05]" />
                        <Skeleton className="h-[200px] w-full rounded-2xl dark:bg-white/[0.05]" />
                        <Skeleton className="h-[200px] w-full rounded-2xl dark:bg-white/[0.05]" />
                    </>
                ) : (
                    <>
                        <IntegrationCard
                            logo={
                                <Image
                                    src={recurrenteLogoSrc}
                                    alt="Recurrente"
                                    width={44}
                                    height={44}
                                    className="object-contain dark:invert"
                                />
                            }
                            name="Recurrente"
                            description={t('integrations.recurrenteDesc')}
                            isConfigured={isConfigured ?? false}
                            onConfigure={() => setSheetOpen(true)}
                            proOnly
                            userIsPro={isProOrPremium}
                            badges={[
                                <div key="gt" className="w-5 rounded-[3px] overflow-hidden border border-gray-200 dark:border-white/[0.1]">
                                    <Gt className="w-full h-auto" />
                                </div>,
                                <div key="sv" className="w-5 rounded-[3px] overflow-hidden border border-gray-200 dark:border-white/[0.1]">
                                    <Sv className="w-full h-auto" />
                                </div>,
                            ]}
                            disabledReason={!isRecurrenteSupported ? t('integrations.notSupportedCountry') : undefined}
                        />
                        <IntegrationCard
                            logo={
                                <Image
                                    src="/integrations/drive-logo.png"
                                    alt="Google Drive"
                                    width={44}
                                    height={44}
                                    className="object-contain"
                                />
                            }
                            name="Google Drive"
                            description={t('integrations.driveDesc')}
                            isConfigured={false}
                            onConfigure={() => {}}
                            comingSoon
                            proOnly
                            userIsPro={isProOrPremium}
                        />
                        <IntegrationCard
                            logo={
                                <Image
                                    src="/integrations/rest-api.png"
                                    alt="API Access"
                                    width={44}
                                    height={44}
                                    className="object-contain dark:invert"
                                />
                            }
                            name="Krew API"
                            description={t('integrations.apiDesc')}
                            isConfigured={false}
                            onConfigure={() => {}}
                            comingSoon
                            proOnly
                            userIsPro={isProOrPremium}
                        />
                        <IntegrationCard
                            logo={
                                <Image
                                    src="/integrations/n8n.png"
                                    alt="n8n"
                                    width={44}
                                    height={44}
                                    className="object-contain"
                                />
                            }
                            name="n8n Templates"
                            description={t('integrations.n8nDesc')}
                            isConfigured={false}
                            onConfigure={() => {}}
                            comingSoon
                            proOnly
                            userIsPro={isProOrPremium}
                        />
                    </>
                )}
            </div>

            {/* Sheet: Recurrente config */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto border-l border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111111]">
                    <SheetHeader className="px-6 pt-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-100 dark:border-white/[0.08] flex items-center justify-center p-2">
                                <Image
                                    src={recurrenteLogoSrc}
                                    alt="Recurrente"
                                    width={28}
                                    height={28}
                                    className="object-contain dark:invert"
                                />
                            </div>
                            <div>
                                <SheetTitle className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight text-left">
                                    {t('integrations.configRecurrente')}
                                </SheetTitle>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40 mt-0.5">
                                    Recurrente · Pagos recurrentes
                                </p>
                            </div>
                        </div>
                        <SheetDescription className="text-[13px] text-gray-500 dark:text-white/50 leading-relaxed text-left">
                            {t('integrations.configRecurrenteDesc')}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="px-6 py-5">
                        <RecurrenteForm
                            isConfigured={isConfigured ?? false}
                            onUpdateStatus={(status) => {
                                setIsConfigured(status);
                                if (status) setSheetOpen(false);
                            }}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
