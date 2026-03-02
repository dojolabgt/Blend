'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { Globe } from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

export default function DomainsPage() {
    return (
        <DashboardShell>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Dominios</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Conecta tu propio dominio personalizado a tu portal.
                </p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Globe className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Dominios y Marca Blanca</h2>
                        <h3 className="text-lg font-medium text-primary mb-4">Próximamente</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Muy pronto podrás conectar tu propio dominio personalizado para que tus clientes vean tus cotizaciones y servicios bajo tu propia marca (ej. clientes.tumarca.com).
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    );
}
