'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { projectsApi } from '@/features/projects/api';
import { clientsApi } from '@/features/clients/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

interface ClientOption {
    id: string;
    name: string;
    email: string;
}

export function CreateProjectDialog({ open, onClose, onCreated }: Props) {
    const { activeWorkspace } = useAuth();
    const { t } = useWorkspaceSettings();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [clientId, setClientId] = useState('');
    const [currency, setCurrency] = useState('');
    const [budget, setBudget] = useState('');
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open || !activeWorkspace?.id) return;
        clientsApi.getAll({ limit: 100 })
            .then((res) => setClients(res.data ?? []))
            .catch(() => setClients([]));
    }, [open, activeWorkspace?.id]);

    const currencies: { code: string; label: string }[] = activeWorkspace?.currencies?.length
        ? activeWorkspace.currencies.map((c: { code: string; name?: string; symbol?: string }) => ({
              code: c.code,
              label: `${c.code}${c.symbol ? ` (${c.symbol})` : ''}`,
          }))
        : [
              { code: 'USD', label: 'USD ($)' },
              { code: 'GTQ', label: 'GTQ (Q)' },
              { code: 'EUR', label: 'EUR (€)' },
              { code: 'MXN', label: 'MXN ($)' },
          ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !activeWorkspace?.id) return;

        setIsSaving(true);
        try {
            await projectsApi.create(activeWorkspace.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                clientId: clientId || undefined,
                currency: currency || undefined,
                budget: budget ? Number(budget) : undefined,
            });
            toast.success(t('projects.createSuccess'));
            onCreated();
            handleClose();
        } catch {
            toast.error(t('projects.createError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setClientId('');
        setCurrency('');
        setBudget('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-primary" />
                        {t('projects.createTitle')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="proj-name">{t('projects.createNameLabel')}</Label>
                        <Input
                            id="proj-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('projects.createNamePlaceholder')}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="proj-desc">{t('projects.createDescLabel')}</Label>
                        <Textarea
                            id="proj-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('projects.createDescPlaceholder')}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t('projects.createClientLabel')}</Label>
                        <Select value={clientId} onValueChange={setClientId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('projects.createClientNone')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">{t('projects.createClientNone')}</SelectItem>
                                {clients.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                        {c.email ? (
                                            <span className="ml-1.5 text-xs text-muted-foreground">
                                                {c.email}
                                            </span>
                                        ) : null}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">
                            {t('projects.createClientHint')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>{t('projects.createCurrencyLabel')}</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('projects.createCurrencyNone')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">{t('projects.createCurrencyNone')}</SelectItem>
                                    {currencies.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="proj-budget">{t('projects.createBudgetLabel')}</Label>
                            <Input
                                id="proj-budget"
                                type="number"
                                min={0}
                                step="0.01"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            {t('projects.createCancelBtn')}
                        </Button>
                        <Button type="submit" disabled={isSaving || !name.trim()}>
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <FolderPlus className="w-4 h-4 mr-2" />
                            )}
                            {isSaving ? t('projects.createSavingBtn') : t('projects.createSaveBtn')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
