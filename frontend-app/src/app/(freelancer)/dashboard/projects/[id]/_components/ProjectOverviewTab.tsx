'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, LayoutTemplate, Mail, MessageCircle, Share2, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProjectData } from '../layout';

export function ProjectOverviewTab({ project }: { project: ProjectData }) {
    const { activeWorkspace } = useAuth();
    const { deal } = project;
    const brief = deal?.brief;
    const quotation = deal?.quotations?.find((q: { isApproved?: boolean }) => q.isApproved) || deal?.quotations?.[0];

    const getCurrencySymbol = () => {
        let symbol = deal?.currency?.symbol || '$';
        if (quotation?.currency) {
            const found = activeWorkspace?.currencies?.find((c: { code: string; symbol: string }) => c.code === quotation.currency);
            if (found) symbol = found.symbol;
            else {
                const fallbacks: Record<string, string> = { GTQ: 'Q', USD: '$', EUR: '€', MXN: '$', GBP: '£', JPY: '¥' };
                symbol = fallbacks[quotation.currency] || quotation.currency;
            }
        }
        return symbol;
    };

    const sym = getCurrencySymbol();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Context / Description ─────────────────────── */}
                <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                        <CardTitle className="text-base font-semibold">Contexto del Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-5">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {deal?.proposalIntro || 'No hay una descripción general establecida para este proyecto.'}
                        </p>

                        {quotation && (
                            <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Cotización {quotation.isApproved ? '· Aprobada' : ''}
                                    </p>
                                    {quotation.isApproved && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            Aprobada
                                        </span>
                                    )}
                                </div>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                                    {quotation.optionName || 'Cotización'}
                                </p>
                                {(quotation.items?.length ?? 0) > 0 && (
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {quotation.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                                                <span className="truncate pr-4">{item.name} <span className="text-zinc-400">×{item.quantity}</span></span>
                                                <span className="font-medium text-zinc-800 dark:text-zinc-200 shrink-0">{sym}{Number(item.price).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                    <span className="text-xs text-zinc-500">Total</span>
                                    <span className="text-base font-bold text-zinc-900 dark:text-white">
                                        {sym}{Number(quotation.total ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                        <span className="text-[10px] font-normal text-zinc-400 ml-1">{quotation.currency}</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
                            {brief && (
                                <Link href={`/dashboard/projects/${project.id}/brief`}>
                                    <Button variant="secondary" size="sm">
                                        <LayoutTemplate className="w-4 h-4 mr-2" /> Ver Brief
                                    </Button>
                                </Link>
                            )}
                            {deal?.publicToken && (
                                <Button variant="outline" size="sm" onClick={() => {
                                    const base = process.env.NEXT_PUBLIC_FRONTEND_PUBLIC_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname.replace('app.', 'client.')}${window.location.port === '3000' ? ':3001' : ''}` : '');
                                    window.open(`${base}/d/${deal.publicToken}`, '_blank');
                                }}>
                                    <Share2 className="w-4 h-4 mr-2" /> Ver Propuesta
                                </Button>
                            )}
                            {quotation && !deal?.publicToken && (
                                <Link href={`/dashboard/projects/${project.id}/assets`}>
                                    <Button variant="outline" size="sm">
                                        <FileText className="w-4 h-4 mr-2" /> Ver Documentos
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Client info ──────────────────────────────── */}
                <div className="space-y-4">
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-zinc-400" /> Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div>
                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Nombre</p>
                                <p className="font-semibold text-sm text-zinc-900 dark:text-white">{deal?.client?.name || '—'}</p>
                            </div>
                            {deal?.client?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    <a href={`mailto:${deal.client.email}`} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors truncate">
                                        {deal.client.email}
                                    </a>
                                </div>
                            )}
                            {deal?.client?.whatsapp && (
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    <a href={`https://wa.me/${deal.client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">
                                        {deal.client.whatsapp}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Team summary */}
                    {(project.collaborators?.length ?? 0) > 0 && (
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                <CardTitle className="text-base font-semibold">Equipo</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                {project.collaborators?.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{c.workspace.businessName}</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                            {c.role === 'editor' ? 'Editor' : 'Lector'}
                                        </span>
                                    </div>
                                ))}
                                <Link href={`/dashboard/projects/${project.id}/team`} className="block pt-1">
                                    <Button variant="ghost" size="sm" className="w-full text-xs text-zinc-500 hover:text-primary">
                                        Gestionar equipo →
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
