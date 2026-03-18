'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    FileText, Share2, FolderPlus, Upload, Trash2, ExternalLink,
    Loader2, HardDrive, FolderOpen, File, FileImage, FileVideo,
    FileArchive, Settings,
} from 'lucide-react';
import { useProject } from '../layout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { projectDriveApi, DriveFile } from '@/features/projects/driveApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── File icon helper ─────────────────────────────────────────────────────────

function FileIcon({ mimeType, className }: { mimeType: string; className?: string }) {
    if (mimeType.startsWith('image/')) return <FileImage className={className} />;
    if (mimeType.startsWith('video/')) return <FileVideo className={className} />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed'))
        return <FileArchive className={className} />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet'))
        return <FileText className={className} />;
    return <File className={className} />;
}

function formatBytes(bytes?: string) {
    const n = parseInt(bytes ?? '0', 10);
    if (!n) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Quotation Card ───────────────────────────────────────────────────────────

function QuotationCard() {
    const { project } = useProject();
    const { activeWorkspace } = useAuth();
    const { t } = useWorkspaceSettings();
    const { deal } = project;
    const quotation = deal?.quotations?.find((q: { isApproved?: boolean }) => q.isApproved) || deal?.quotations?.[0];

    const getCurrencySymbol = () => {
        let symbol = deal?.currency?.symbol || '$';
        if (quotation?.currency) {
            const found = activeWorkspace?.currencies?.find((c: { code: string; symbol: string }) => c.code === quotation.currency);
            if (found) symbol = found.symbol;
            else {
                const fallbacks: Record<string, string> = {
                    GTQ: 'Q', USD: '$', EUR: '€', MXN: '$', GBP: '£', JPY: '¥',
                    CAD: '$', AUD: '$', CHF: 'Fr', CNY: '¥', BRL: 'R$', COP: '$',
                    ARS: '$', PEN: 'S/', CLP: '$', CRC: '₡', HNL: 'L', NIO: 'C$',
                    DOP: 'RD$', KRW: '₩', INR: '₹', SAR: '﷼', AED: 'د.إ',
                };
                symbol = fallbacks[quotation.currency] || quotation.currency;
            }
        }
        return symbol;
    };

    const fmt = (val?: number | string) => {
        if (val === undefined || val === null) return `${getCurrencySymbol()}0.00`;
        return `${getCurrencySymbol()}${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-3 pt-5">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {t('assets.quotationCard')}
                    </CardTitle>
                    {quotation?.isApproved && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200">
                            {t('assets.quotationApproved')}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {quotation ? (
                    <div className="space-y-5">
                        <div>
                            <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                                {quotation.optionName || t('assets.quotationSingle')}
                            </h3>
                            {quotation.description && (
                                <p className="text-sm text-zinc-500 line-clamp-2">{quotation.description}</p>
                            )}
                        </div>
                        <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
                            {quotation.items?.map((item: { name: string; quantity: string | number; price: string | number }, idx: number) => (
                                <div key={idx} className="flex justify-between items-start py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                                    <div className="pr-3 flex-1">
                                        <p className="font-medium text-zinc-800 dark:text-zinc-200 text-[13px]">{item.name}</p>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">{t('assets.qty')} {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-zinc-900 dark:text-white text-[13px] shrink-0">{fmt(item.price)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="font-medium text-sm text-zinc-600 dark:text-zinc-400">Total:</span>
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                {fmt(quotation.total)}
                                {quotation.currency && <span className="text-[10px] font-normal text-zinc-500 ml-1">{quotation.currency}</span>}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => {
                            const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_PUBLIC_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname.replace('app.', 'client.')}${window.location.port === '3000' ? ':3001' : ''}` : '');
                            window.open(`${baseUrl}/d/${deal?.publicToken}`, '_blank');
                        }}>
                            <Share2 className="w-4 h-4 mr-2" /> {t('assets.quotationViewPublic')}
                        </Button>
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-sm text-zinc-500">{t('assets.quotationNone')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Drive Section ────────────────────────────────────────────────────────────

function DriveSection() {
    const { project, refreshProject } = useProject();
    const { activeWorkspace } = useAuth();
    const { t } = useWorkspaceSettings();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isDriveConnected = !!(activeWorkspace?.googleDriveEmail);
    const hasDriveFolder = !!project.driveFolderId;

    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

    useEffect(() => {
        if (!isDriveConnected || !hasDriveFolder) return;
        setLoadingFiles(true);
        projectDriveApi.getFiles(project.id)
            .then(setFiles)
            .catch(() => toast.error(t('assets.driveLoadError')))
            .finally(() => setLoadingFiles(false));
    }, [project.id, isDriveConnected, hasDriveFolder]);

    const handleCreateFolder = async () => {
        setCreatingFolder(true);
        try {
            await projectDriveApi.createFolder(project.id);
            toast.success(t('assets.driveFolderCreated'));
            await refreshProject();
        } catch {
            toast.error(t('assets.driveFolderError'));
        } finally {
            setCreatingFolder(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFile(true);
        try {
            const uploaded = await projectDriveApi.uploadFile(project.id, file);
            setFiles(prev => [uploaded, ...prev]);
            toast.success(t('assets.driveUploadSuccess'));
        } catch {
            toast.error(t('assets.driveUploadError'));
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm(t('assets.driveDeleteConfirm'))) return;
        setDeletingFileId(fileId);
        try {
            await projectDriveApi.deleteFile(project.id, fileId);
            setFiles(prev => prev.filter(f => f.id !== fileId));
            toast.success(t('assets.driveDeleteSuccess'));
        } catch {
            toast.error(t('assets.driveDeleteError'));
        } finally {
            setDeletingFileId(null);
        }
    };

    // ── Drive not connected ──
    if (!isDriveConnected) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                    <HardDrive className="w-6 h-6 text-zinc-400 dark:text-white/30" />
                </div>
                <h3 className="font-semibold text-[15px] text-zinc-900 dark:text-white mb-1.5">
                    {t('assets.driveNotConnectedTitle')}
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-white/45 max-w-xs mx-auto mb-5 leading-relaxed">
                    {t('assets.driveNotConnectedDesc')}
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/settings/integrations')}
                    className="gap-2"
                >
                    <Settings className="w-3.5 h-3.5" />
                    {t('assets.driveNotConnectedBtn')}
                </Button>
            </div>
        );
    }

    // ── No folder yet ──
    if (!hasDriveFolder) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                    <FolderPlus className="w-6 h-6 text-zinc-400 dark:text-white/30" />
                </div>
                <h3 className="font-semibold text-[15px] text-zinc-900 dark:text-white mb-1.5">
                    {t('assets.driveNoFolderTitle')}
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-white/45 max-w-xs mx-auto mb-5 leading-relaxed">
                    {t('assets.driveNoFolderDesc')}
                </p>
                <Button size="sm" onClick={handleCreateFolder} disabled={creatingFolder} className="gap-2">
                    {creatingFolder
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <FolderPlus className="w-3.5 h-3.5" />
                    }
                    {creatingFolder ? t('assets.driveCreatingFolder') : t('assets.driveCreateFolderBtn')}
                </Button>
            </div>
        );
    }

    // ── Folder exists — show files ──
    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <FolderOpen className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                    <div>
                        <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">
                            {t('assets.driveSection')}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-white/35">
                            {files.length} {files.length === 1 ? t('assets.filesSingular') : t('assets.filesPlural')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {project.driveFolderUrl && (
                        <a
                            href={project.driveFolderUrl as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-medium text-zinc-600 dark:text-white/60 hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {t('assets.driveViewFolder')}
                        </a>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[12px] font-semibold hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                        {uploadingFile
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Upload className="w-3.5 h-3.5" />
                        }
                        {uploadingFile ? t('assets.driveUploading') : t('assets.driveUploadBtn')}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </div>
            </div>

            {/* File list */}
            {loadingFiles ? (
                <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-zinc-400 dark:text-white/35">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('assets.driveLoading')}
                </div>
            ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                        <Upload className="w-5 h-5 text-zinc-300 dark:text-white/25" />
                    </div>
                    <p className="text-[13px] font-medium text-zinc-700 dark:text-white/60 mb-1">{t('assets.driveEmptyTitle')}</p>
                    <p className="text-[12px] text-zinc-400 dark:text-white/35 max-w-xs">{t('assets.driveEmptyDesc')}</p>
                </div>
            ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="group flex items-center gap-3 px-5 py-3 hover:bg-zinc-50/60 dark:hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                                <FileIcon mimeType={file.mimeType} className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-zinc-900 dark:text-white truncate">{file.name}</p>
                                <p className="text-[11px] text-zinc-400 dark:text-white/35">
                                    {formatBytes(file.size)} · {formatDate(file.createdTime)}
                                </p>
                            </div>
                            <div className={cn(
                                'flex items-center gap-1 transition-opacity',
                                'opacity-0 group-hover:opacity-100'
                            )}>
                                <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 dark:text-white/35 hover:text-zinc-700 dark:hover:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-colors"
                                    title={t('assets.driveOpenInDrive')}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                    onClick={() => handleDelete(file.id)}
                                    disabled={deletingFileId === file.id}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                                    title={t('assets.driveDeleteFile')}
                                >
                                    {deletingFileId === file.id
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Trash2 className="w-3.5 h-3.5" />
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectAssetsPage() {
    const { t } = useWorkspaceSettings();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t('assets.title')}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('assets.titleDesc')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quotation — narrower column */}
                <div className="lg:col-span-1">
                    <QuotationCard />
                </div>

                {/* Drive — wider column */}
                <div className="lg:col-span-2">
                    <DriveSection />
                </div>
            </div>
        </div>
    );
}
