'use client';

import { AccountDetailsForm } from './_components/AccountDetailsForm';
import { SecurityForm } from './_components/SecurityForm';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function AccountPage() {
    return (
        <DashboardShell>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Mi Cuenta</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Modifica tu información personal y opciones de seguridad de acceso.
                </p>
            </div>

            {/* Content — constrained width for form pages */}
            <div className="max-w-2xl">
                <AccountDetailsForm />
                <SecurityForm />
            </div>
        </DashboardShell>
    );
}
