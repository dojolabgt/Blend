'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    type BooleanPlanFeature,
    type PlanFeature,
    type PlanTier,
    getPlanLimit,
    hasFeature,
    requiredPlanFor,
} from '@/lib/plan-limits';

interface PlanGateResult {
    /** Whether the current plan allows this feature/limit. */
    allowed: boolean;
    /** Current workspace plan. */
    plan: PlanTier;
    /** Minimum plan required (null means free is enough). */
    requiredPlan: 'pro' | 'premium' | null;
}

/**
 * Checks whether a boolean feature flag is available for the current workspace plan.
 *
 * @example
 * const { allowed } = usePlanGate('googleDrive');
 * if (!allowed) return <LockedState />;
 */
export function usePlanGate(feature: BooleanPlanFeature): PlanGateResult {
    const { activeWorkspace } = useAuth();
    const plan: PlanTier = (activeWorkspace?.plan as PlanTier) ?? 'free';
    const allowed = hasFeature(plan, feature);
    const requiredPlan = requiredPlanFor(feature);
    return { allowed, plan, requiredPlan };
}

/**
 * Returns the numeric limit for a feature on the current plan.
 *
 * @example
 * const { limit, plan } = usePlanLimit('activeDeals');
 * if (deals.length >= limit) showUpgradePrompt();
 */
export function usePlanLimit(feature: PlanFeature): { limit: number | typeof Infinity; plan: PlanTier } {
    const { activeWorkspace } = useAuth();
    const plan: PlanTier = (activeWorkspace?.plan as PlanTier) ?? 'free';
    const limit = getPlanLimit(plan, feature) as number;
    return { limit, plan };
}
