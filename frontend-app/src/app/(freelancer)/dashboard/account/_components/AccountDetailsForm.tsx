'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { usersApi } from '@/features/users/api';
import { getImageUrl } from '@/lib/utils';

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const accountSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().email('Correo electrónico inválido').min(1, 'El correo es obligatorio'),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountDetailsForm() {
    const { user, checkAuth } = useAuth();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limite de 2MB
        const MAX_SIZE_MB = 2;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`La imagen excede el límite de ${MAX_SIZE_MB}MB. Por favor, elige una más pequeña.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploadingImage(true);
        try {
            await usersApi.uploadProfileImage(file);
            toast.success('Foto de perfil actualizada correctamente');
            await checkAuth(); // Refresca el usuario en el contexto global
        } catch (error: any) {
            console.error('Error uploading profile image', error);
            const backendMsg = error?.response?.data?.message;
            const msg = typeof backendMsg === 'string' ? backendMsg :
                (error?.response?.status === 413 ? 'El archivo es demasiado grande para el servidor.' : 'Error al subir la imagen');
            toast.error(msg);
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (values: AccountFormValues) => {
        setIsSaving(true);
        try {
            await usersApi.updateProfile({
                name: values.name,
                // email no lo actualizamos por ahora o si? backend DTO permite email.
                // Pero si cambia su email, podría afectar el login. Lo enviamos si es distinto.
                ...(values.email !== user?.email ? { email: values.email } : {})
            });
            toast.success('Detalles de cuenta guardados');
            await checkAuth(); // Refrescar los cambios globalmente
        } catch (error: any) {
            console.error('Error updating profile', error);
            toast.error(error?.response?.data?.message || 'Error al guardar los cambios');
        } finally {
            setIsSaving(false);
        }
    };

    const initials = (user?.name || user?.email || 'U')[0].toUpperCase();
    const currentImage = getImageUrl(user?.profileImage);

    return (
        <div className="rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Foto de Perfil */}
            <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-border/50 bg-zinc-50/30 dark:bg-zinc-900/30">
                <div className="relative group flex-shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary/30 to-primary/0 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <Avatar
                        className="relative h-20 w-20 border-2 border-background shadow-sm cursor-pointer transition-all duration-300 group-hover:scale-[1.02]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <AvatarImage src={currentImage} alt={user?.name || 'Usuario'} className="object-cover" />
                        <AvatarFallback className="text-2xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploadingImage
                            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                            : <Camera className="w-6 h-6 text-white" />
                        }
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Foto Personal</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">
                        Esta foto es para el acceso interno y tu identificación personal. No se mostrará a tus clientes. JPG, PNG o WebP. Máximo 2MB.
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Nombre completo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Pablo Lacán"
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300 font-medium">Correo electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="pablo@ejemplo.com"
                                            type="email"
                                            {...field}
                                            className="transition-all duration-200 focus-visible:ring-primary/20 bg-zinc-50/50 dark:bg-zinc-900/50"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Cambiar tu correo electrónico alterará las credenciales con las que accedes a Blend.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto min-w-[140px] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar cambios'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
