'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText, Mail, MessageCircle, User, Share2,
    FolderOpen, CheckSquare, CreditCard, Users,
    Link as LinkIcon, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { ProjectData, getProjectClientName, getProjectValue } from '../layout';

export function ProjectOverviewTab({ project }: { project: ProjectData }) {
    const { activeWorkspace } = useAuth();
    const { t } = useWorkspaceSettings();

    const deal = project.deal;
    const clientName = getProjectClientName(project, '—');

    // Currency resolution
    const getCurrencySymbol = () => {
        const currCode = deal?.currency?.code ?? project.currency;
        if (deal?.currency?.symbol) return deal.currency.symbol;
        if (currCode && activeWorkspace?.currencies) {
            const found = activeWorkspace.currencies.find(
                (c: { code: string; symbol: string }) => c.code === currCode,
            );
            if (found) return found.symbol;
        }
        const fallbacks: Record<string, string> = {
            GTQ: 'Q', USD: '$', EUR: '€', MXN: '$', GBP: '£',
            CAD: '$', AUD: '$', CHF: 'Fr', BRL: 'R$',
        };
        return fallbacks[currCode ?? ''] ?? '$';
    };

    const sym = getCurrencySymbol();
    const currCode = deal?.currency?.code ?? project.currency ?? '';
    const valueStr = getProjectValue(project, sym);
    const quotation = deal?.quotations?.find((q) => q.isApproved) ?? deal?.quotations?.[0];

    // Quick nav links
    const quickLinks = [
        { label: t('projects.tabTasks'), href: `/dashboard/projects/${project.id}/tasks`, icon: CheckSquare },
        { label: t('projects.tabAssets'), href: `/dashboard/projects/${project.id}/assets`, icon: FolderOpen },
        { label: t('projects.tabPayments'), href: `/dashboard/projects/${project.id}/payments`, icon: CreditCard },
        { label: t('projects.tabCollaborators'), href: `/dashboard/projects/${project.id}/team`, icon: Users },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left: Context / Description ────────────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Description / Context */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                {t('overview.contextTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5">
                            {project.description ? (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                    {project.description}
                                </p>
                            ) : deal?.proposalIntro ? (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                    {deal.proposalIntro}
                                </p>
                            ) : (
                                <p className="text-sm text-zinc-400 italic">
                                    {t('overview.noDescription')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quotation summary (deal-based only) */}
                    {quotation && (
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        {t('overview.quotationTitle')}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {quotation.isApproved && (
                                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                                                {t('overview.quotationApproved')}
                                            </Badge>
                                        )}
                                        {deal?.publicToken && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => {
                                                    const baseUrl =
                                                        process.env.NEXT_PUBLIC_FRONTEND_PUBLIC_URL ||
                                                        (typeof window !== 'undefined'
                                                            ? `${window.location.protocol}//${window.location.hostname.replace('app.', 'client.')}${window.location.port === '3000' ? ':3001' : ''}`
                                                            : '');
                                                    window.open(`${baseUrl}/d/${deal.publicToken}`, '_blank');
                                                }}
                                            >
                                                <Share2 className="w-3 h-3 mr-1" />
                                                {t('overview.viewPublic')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {quotation.optionName && (
                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-3">
                                        {quotation.optionName}
                                    </p>
                                )}
                                {(quotation.items?.length ?? 0) > 0 && (
                                    <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto pr-1">
                                        {quotation.items?.map(
                                            (
                                                item: { name: string; quantity: string | number; price: string | number },
                                                idx: number,
                                            ) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center text-sm py-1.5 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                                                >
                                                    <span className="text-zinc-700 dark:text-zinc-300 text-[13px]">
                                                        {item.name}
                                                        <span className="text-xs text-zinc-400 ml-1.5">
                                                            ×{item.quantity}
                                                        </span>
                                                    </span>
                                                    <span className="font-semibold text-zinc-900 dark:text-white text-[13px]">
                                                        {sym}
                                                        {Number(item.price).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                    <span className="text-sm font-medium text-zinc-500">Total</span>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {sym}
                                            {Number(quotation.total ?? 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                        {currCode && (
                                            <span className="text-[10px] text-zinc-400 ml-1">{currCode}</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Standalone budget (no deal) */}
                    {!deal && project.budget && (
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <CardContent className="pt-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-zinc-500 font-medium">
                                        {t('overview.budgetLabel')}
                                    </p>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {valueStr}
                                        </p>
                                        {currCode && (
                                            <p className="text-xs text-zinc-400">{currCode}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ── Right: Client info + Quick nav ─────────────────── */}
                <div className="space-y-5">

                    {/* Client card */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                {t('overview.clientTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {clientName !== '—' ? (
                                <>
                                    <div>
                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {clientName}
                                        </p>
                                    </div>
                                    {(deal?.client?.email ?? project.client?.email) && (
                                        <a
                                            href={`mailto:${deal?.client?.email ?? project.client?.email}`}
                                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-primary transition-colors"
                                        >
                                            <Mail className="w-4 h-4 shrink-0" />
                                            {deal?.client?.email ?? project.client?.email}
                                        </a>
                                    )}
                                    {deal?.client?.whatsapp && (
                                        <a
                                            href={`https://wa.me/${deal.client.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-primary transition-colors"
                                        >
                                            <MessageCircle className="w-4 h-4 shrink-0" />
                                            {deal.client.whatsapp}
                                        </a>
                                    )}
                                    {deal?.publicToken && (
                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                            <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">
                                                {t('overview.portalLink')}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs gap-1.5"
                                                onClick={() => {
                                                    const baseUrl =
                                                        process.env.NEXT_PUBLIC_FRONTEND_PUBLIC_URL ||
                                                        (typeof window !== 'undefined'
                                                            ? `${window.location.protocol}//${window.location.hostname.replace('app.', 'client.')}${window.location.port === '3000' ? ':3001' : ''}`
                                                            : '');
                                                    window.open(`${baseUrl}/d/${deal.publicToken}`, '_blank');
                                                }}
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {t('overview.openPortal')}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-4 text-center">
                                    <User className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                                    <p className="text-sm text-zinc-400 italic">
                                        {t('overview.noClientAssigned')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick navigation */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-primary" />
                                {t('overview.quickNav')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                            <div className="space-y-1">
                                {quickLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-primary transition-colors"
                                    >
                                        <link.icon className="w-4 h-4 shrink-0" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
