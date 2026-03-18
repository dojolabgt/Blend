'use client';

import { useState, useEffect, useCallback } from 'react';
import { DealRoadmapSidebar } from './DealRoadmapSidebar';
import { DealCanvas } from './DealCanvas';
import { useDeals, type DealStatus } from '@/hooks/use-deals';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type DealStep = 'brief' | 'quotation' | 'payment_plan' | 'won';

interface DealData {
    id: string;
    currentStep?: string;
    status?: string;
    briefTemplateId?: string;
    workspace?: { id: string };
    workspaceId?: string;
    [key: string]: unknown;
}

interface DealBuilderProps {
    dealId: string;
}

export function DealBuilder({ dealId }: DealBuilderProps) {
    const { fetchDeal, updateDeal } = useDeals();
    const { t } = useWorkspaceSettings();

    const [deal, setDeal] = useState<DealData | null>(null);
    const [activeStep, setActiveStep] = useState<DealStep>('brief');
    const [isLoading, setIsLoading] = useState(true);
    const [showWonDialog, setShowWonDialog] = useState(false);
    const [showLostDialog, setShowLostDialog] = useState(false);

    const loadDeal = useCallback(async () => {
        setIsLoading(true);
        const data = await fetchDeal(dealId);
        if (data) {
            setDeal(data);
            setActiveStep((data.currentStep as DealStep) || 'brief');
        }
        setIsLoading(false);
    }, [dealId, fetchDeal]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadDeal();
    }, [loadDeal]);

    const handleStepChange = async (step: DealStep) => {
        setActiveStep(step);

        const indexMap: Record<DealStep, number> = { brief: 0, quotation: 1, payment_plan: 2, won: 3 };
        const currentHighest = (deal?.currentStep as DealStep) || 'brief';

        // Solo actualizar el backend si es que estamos avanzando a un paso más lejano
        if (indexMap[step] > indexMap[currentHighest]) {
            await updateDeal(dealId, { currentStep: step });
            // Keep local deal state in sync so the sidebar's isLocked logic reflects the new currentStep
            setDeal((prev) => prev ? { ...prev, currentStep: step } : null);
        }
    };

    const handleUpdateBrief = async (templateId: string | null) => {
        // Step 1 is optional — always advance to quotation regardless of templateId
        const updated = await updateDeal(dealId, {
            briefTemplateId: templateId || undefined,
            currentStep: 'quotation',
        });
        if (updated) {
            // Reload full deal so brief.template relation is populated
            const fresh = await fetchDeal(dealId);
            setDeal(fresh || updated);
            setActiveStep('quotation');
        }
    };

    // Silent re-fetch — used by children after mutations so sidebar/state stays in sync
    const refreshDeal = useCallback(async () => {
        const data = await fetchDeal(dealId);
        if (data) setDeal(data);
    }, [dealId, fetchDeal]);

    const STATUS_LABEL: Record<string, string> = {
        DRAFT: t('deals.statusDraft'),
        SENT: t('deals.statusSent'),
        VIEWED: t('deals.statusViewed'),
        NEGOTIATING: t('deals.statusNegotiatingFilter'),
        WON: t('deals.statusWon'),
        LOST: t('deals.statusLost'),
    };

    const handleStatusChange = async (status: DealStatus) => {
        if (status === 'WON') { setShowWonDialog(true); return; }
        if (status === 'LOST') { setShowLostDialog(true); return; }
        const updated = await updateDeal(dealId, { status });
        if (updated) {
            setDeal(updated);
            toast.success(`${t('deals.statusUpdated')} ${STATUS_LABEL[status] ?? status}`);
        }
    };

    const handleWon = async () => {
        const updated = await updateDeal(dealId, { status: 'WON', currentStep: 'won' });
        if (updated) {
            setDeal(updated);
            setActiveStep('won');
            toast.success(t('deals.markWonToast'));
        }
        setShowWonDialog(false);
    };

    const handleLost = async () => {
        const updated = await updateDeal(dealId, { status: 'LOST' });
        if (updated) {
            setDeal(updated);
            toast.error(t('deals.markLostToast'));
        }
        setShowLostDialog(false);
    };


    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-zinc-400">
                    <div className="w-8 h-8 border-2 border-zinc-300 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm">{t('deals.loadingDeal')}</span>
                </div>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center text-zinc-500">
                <p>{t('deals.dealNotFound')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-white dark:bg-zinc-950">
                {/* 25% Sidebar Roadmap */}
                <div className="md:w-1/4 w-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 overflow-y-auto">
                    <DealRoadmapSidebar
                        deal={deal}
                        activeStep={activeStep}
                        onStepChange={handleStepChange}
                        onStatusChange={handleStatusChange}
                        updateDeal={updateDeal}
                    />
                </div>

                {/* 75% Working Canvas */}
                <div className="md:w-3/4 w-full h-full relative bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
                    <DealCanvas
                        deal={deal}
                        activeStep={activeStep}
                        onWon={() => setShowWonDialog(true)}
                        onNextStep={handleStepChange}
                        onUpdateBrief={handleUpdateBrief}
                        onRefreshDeal={refreshDeal}
                    />
                </div>
            </div>

            {/* WON Confirmation Dialog */}
            <AlertDialog open={showWonDialog} onOpenChange={setShowWonDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deals.markWonTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deals.markWonDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleWon}
                        >
                            {t('deals.markWonBtn')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* LOST Confirmation Dialog */}
            <AlertDialog open={showLostDialog} onOpenChange={setShowLostDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deals.markLostTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deals.markLostDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={handleLost}
                        >
                            {t('deals.markLostBtn')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    );
}
