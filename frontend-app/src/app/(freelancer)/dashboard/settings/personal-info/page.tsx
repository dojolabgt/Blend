'use client';

import { AccountDetailsForm } from './_components/AccountDetailsForm';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function AccountPage() {
    return (
        <DashboardShell>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Información Personal</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Modifica tu información personal y los detalles de tu cuenta de usuario.
                </p>
            </div>

            <div className="max-w-3xl">
                <AccountDetailsForm />
            </div>
        </DashboardShell>
    );
}
