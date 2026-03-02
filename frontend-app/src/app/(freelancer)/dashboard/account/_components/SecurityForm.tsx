'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';

import { usersApi } from '@/features/users/api';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const securitySchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 'Debe contener mayúscula, minúscula, y número o símbolo'),
    confirmPassword: z.string().min(1, 'Por favor confirma tu contraseña')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securitySchema>;

export function SecurityForm() {
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<SecurityFormValues>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: SecurityFormValues) => {
        setIsSaving(true);
        try {
            await usersApi.changePassword({
                currentPassword: values.currentPassword,
                password: values.newPassword
            });
            form.reset();
            toast.success('Contraseña actualizada correctamente');
        } catch (error: any) {
            console.error('Error changing password', error);
            const msg = error?.response?.data?.message === 'Invalid current password'
                ? 'La contraseña actual es incorrecta'
                : (error?.response?.data?.message || 'Error al actualizar la contraseña');
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md mt-6">
            <div className="p-6 md:p-8 border-b border-border/50 bg-zinc-50/30 dark:bg-zinc-900/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                    <KeyRound className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Seguridad</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Actualiza la contraseña de tu cuenta de Blend.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Contraseña actual</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        {...field}
                                        className="transition-all duration-200 focus-visible:ring-primary/20 bg-zinc-50/50 dark:bg-zinc-900/50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Nueva contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                            className="transition-all duration-200 focus-visible:ring-primary/20 bg-zinc-50/50 dark:bg-zinc-900/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Confirmar contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                            className="transition-all duration-200 focus-visible:ring-primary/20 bg-zinc-50/50 dark:bg-zinc-900/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            variant="secondary"
                            className="w-full sm:w-auto min-w-[140px] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                'Cambiar contraseña'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
