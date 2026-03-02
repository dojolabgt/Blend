'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceCurrency, ServiceUnitType, ServiceChargeType } from '@/features/services/types';
import { servicesApi } from '@/features/services/api';
import { toast } from 'sonner';

const serviceSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    sku: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    basePrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
    currency: z.nativeEnum(ServiceCurrency),
    unitType: z.nativeEnum(ServiceUnitType),
    chargeType: z.nativeEnum(ServiceChargeType),
    internalCost: z.coerce.number().min(0).optional(),
    isTaxable: z.boolean().default(true),
    category: z.string().optional().nullable(),
    estimatedDeliveryDays: z.coerce.number().min(0).optional().nullable(),
    specificTerms: z.string().optional().nullable(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: any;
}

export function ServiceModal({ open, onOpenChange, onSuccess, initialData }: ServiceModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: '',
            sku: '',
            description: '',
            basePrice: 0,
            currency: ServiceCurrency.GTQ,
            unitType: ServiceUnitType.UNIT,
            chargeType: ServiceChargeType.ONE_TIME,
            internalCost: 0,
            isTaxable: true,
            category: '',
            estimatedDeliveryDays: null,
            specificTerms: '',
        },
    });

    // Update form values when initialData changes
    useEffect(() => {
        if (initialData && open) {
            form.reset({
                name: initialData.name,
                sku: initialData.sku || '',
                description: initialData.description || '',
                basePrice: Number(initialData.basePrice || 0),
                currency: initialData.currency || ServiceCurrency.GTQ,
                unitType: initialData.unitType || ServiceUnitType.UNIT,
                chargeType: initialData.chargeType || ServiceChargeType.ONE_TIME,
                internalCost: Number(initialData.internalCost || 0),
                isTaxable: initialData.isTaxable !== undefined ? initialData.isTaxable : true,
                category: initialData.category || '',
                estimatedDeliveryDays: initialData.estimatedDeliveryDays || null,
                specificTerms: initialData.specificTerms || '',
            });
        } else if (open) {
            form.reset({
                name: '',
                sku: '',
                description: '',
                basePrice: 0,
                currency: ServiceCurrency.GTQ,
                unitType: ServiceUnitType.UNIT,
                chargeType: ServiceChargeType.ONE_TIME,
                internalCost: 0,
                isTaxable: true,
                category: '',
                estimatedDeliveryDays: null,
                specificTerms: '',
            });
        }
    }, [initialData, form, open]);

    const onSubmit = async (values: ServiceFormValues) => {
        setIsSubmitting(true);
        try {
            if (initialData?.id) {
                await servicesApi.update(initialData.id, values as any);
                toast.success('Servicio actualizado correctamente');
            } else {
                await servicesApi.create(values as any);
                toast.success('Servicio creado correctamente');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error('Error al guardar el servicio');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4 rounded-xl">
                                <TabsTrigger value="basic" className="rounded-lg">Básico</TabsTrigger>
                                <TabsTrigger value="pricing" className="rounded-lg">Costos</TabsTrigger>
                                <TabsTrigger value="advanced" className="rounded-lg">Avanzado</TabsTrigger>
                            </TabsList>

                            {/* BÁSICO TAB */}
                            <TabsContent value="basic" className="space-y-4 mt-0">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Servicio</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Diseño de Logotipo" {...field} value={field.value || ''} className="rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="sku"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código / SKU (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. DEV-WEB-01" {...field} value={field.value || ''} className="rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categoría</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. Diseño Gráfico" {...field} value={field.value || ''} className="rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción / Alcance</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Detalla qué incluye este servicio en la propuesta comercial..."
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="rounded-xl resize-none h-24"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* PRECIOS TAB */}
                            <TabsContent value="pricing" className="space-y-4 mt-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="basePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Precio Venta</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} className="rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="internalCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Costo Interno (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value === null ? '' : field.value} className="rounded-xl" />
                                                </FormControl>
                                                <FormDescription className="text-xs">Para calcular margen</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="chargeType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Cobro</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder="Selecciona..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value={ServiceChargeType.ONE_TIME}>Unitario (Fijo)</SelectItem>
                                                        <SelectItem value={ServiceChargeType.HOURLY}>Por Hora</SelectItem>
                                                        <SelectItem value={ServiceChargeType.RECURRING}>Recurrente (Mensual)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="unitType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unidad de Medida</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder="Selecciona..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value={ServiceUnitType.UNIT}>Unidad</SelectItem>
                                                        <SelectItem value={ServiceUnitType.HOUR}>Hora</SelectItem>
                                                        <SelectItem value={ServiceUnitType.PROJECT}>Proyecto</SelectItem>
                                                        <SelectItem value={ServiceUnitType.MONTH}>Mes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Moneda</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder="GTQ" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value={ServiceCurrency.GTQ}>GTQ (Q)</SelectItem>
                                                        <SelectItem value={ServiceCurrency.USD}>USD ($)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isTaxable"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm mt-6">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">Aplica Impuestos</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            {/* AVANZADO TAB */}
                            <TabsContent value="advanced" className="space-y-4 mt-0">
                                <FormField
                                    control={form.control}
                                    name="estimatedDeliveryDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Días Estimados de Entrega</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Ej. 14"
                                                    {...field}
                                                    value={field.value === null ? '' : field.value}
                                                    className="rounded-xl"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">Ayuda a generar cronogramas automáticos.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="specificTerms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Términos Específicos</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ej. 'No incluye compra de tipografías' o 'Sujeto a 3 rondas de cambios'."
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="rounded-xl resize-none h-24"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="pt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-full shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear Servicio')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
