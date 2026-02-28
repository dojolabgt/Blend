'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { UserRole } from '@/types';

/**
 * Validates that the current user has the exact required role.
 * If not, redirects them relative to their actual role, or to /login.
 */
export function useRequireRole(requiredRole: UserRole) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/login');
                return;
            }

            if (user.role !== requiredRole) {
                // If they have the wrong role, send them home
                if (user.role === UserRole.FREELANCER) router.replace('/dashboard');
                else if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) router.replace('/admin');
                else if (user.role === UserRole.CLIENT) router.replace('/portal');
                else router.replace('/login'); // Fallback
            }
        }
    }, [user, isLoading, requiredRole, router]);

    return { user, isLoading, isAuthorized: Boolean(user && user.role === requiredRole) };
}

/**
 * Validates that the current user has AT LEAST ONE of the allowed roles.
 */
export function useRequireRoles(allowedRoles: readonly UserRole[]) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/login');
                return;
            }

            if (!allowedRoles.includes(user.role)) {
                // Return to their actual base location
                if (user.role === UserRole.FREELANCER) router.replace('/dashboard');
                else if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) router.replace('/admin');
                else if (user.role === UserRole.CLIENT) router.replace('/portal');
                else router.replace('/login');
            }
        }
    }, [user, isLoading, allowedRoles, router]);

    return { user, isLoading, isAuthorized: Boolean(user && allowedRoles.includes(user.role)) };
}
