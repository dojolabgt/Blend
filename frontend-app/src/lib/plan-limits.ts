// Mirror of src/billing/plan-limits.constants.ts in the backend.
// Keep in sync when backend limits change.

export const PLAN_LIMITS = {
    FREE: {
        // Deals
        activeDeals: 5,
        quotationOptions: 1,
        quotationItems: 15,
        briefTemplates: 2,
        pdfsPerMonth: 5,
        milestoneItems: 1,
        // Projects
        activeProjects: 3,
        collaboratorsPerProject: 2,
        projectBriefs: 2,
        // Clients & Services
        clients: 15,
        services: 10,
        // Workspace
        workspaceMembers: 1,
        currencies: 1,
        taxes: 1,
        // Connections
        connections: 5,
        // Feature flags (boolean)
        canSendConnections: false,
        googleDrive: false,
        recurrente: false,
        clientUploads: false,
        passwordProtectedDeals: false,
        brandCustomization: false,
        milestoneSplits: false,
        taxReporting: false,
        proposalTerms: false,
        internalCost: false,
        abQuotations: false,
        clientPortalInvite: false,
        serviceImages: false,
    },

    PRO: {
        activeDeals: 25,
        quotationOptions: 3,
        quotationItems: 100,
        briefTemplates: 15,
        pdfsPerMonth: 60,
        milestoneItems: 8,
        activeProjects: 15,
        collaboratorsPerProject: 8,
        projectBriefs: 10,
        clients: 200,
        services: 75,
        workspaceMembers: 1,
        currencies: 5,
        taxes: 8,
        connections: 30,
        canSendConnections: true,
        googleDrive: true,
        recurrente: true,
        clientUploads: true,
        passwordProtectedDeals: true,
        brandCustomization: true,
        milestoneSplits: false,
        taxReporting: false,
        proposalTerms: true,
        internalCost: true,
        abQuotations: true,
        clientPortalInvite: true,
        serviceImages: true,
    },

    PREMIUM: {
        activeDeals: Infinity,
        quotationOptions: Infinity,
        quotationItems: Infinity,
        briefTemplates: Infinity,
        pdfsPerMonth: Infinity,
        milestoneItems: Infinity,
        activeProjects: Infinity,
        collaboratorsPerProject: Infinity,
        projectBriefs: Infinity,
        clients: Infinity,
        services: Infinity,
        workspaceMembers: Infinity,
        currencies: Infinity,
        taxes: Infinity,
        connections: Infinity,
        canSendConnections: true,
        googleDrive: true,
        recurrente: true,
        clientUploads: true,
        passwordProtectedDeals: true,
        brandCustomization: true,
        milestoneSplits: true,
        taxReporting: true,
        proposalTerms: true,
        internalCost: true,
        abQuotations: true,
        clientPortalInvite: true,
        serviceImages: true,
    },
} as const;

export type PlanTier = 'free' | 'pro' | 'premium';
export type PlanFeature = keyof typeof PLAN_LIMITS.FREE;
export type BooleanPlanFeature = {
    [K in PlanFeature]: (typeof PLAN_LIMITS.FREE)[K] extends boolean ? K : never;
}[PlanFeature];

/** Returns the limit/flag for a given plan and feature. */
export function getPlanLimit(plan: PlanTier, feature: PlanFeature) {
    const key = plan.toUpperCase() as 'FREE' | 'PRO' | 'PREMIUM';
    return PLAN_LIMITS[key][feature];
}

/** Returns true if the boolean feature flag is enabled for the given plan. */
export function hasFeature(plan: PlanTier, feature: BooleanPlanFeature): boolean {
    return getPlanLimit(plan, feature) as boolean;
}

/** Returns the minimum plan required for a boolean feature. */
export function requiredPlanFor(feature: BooleanPlanFeature): 'pro' | 'premium' | null {
    if (PLAN_LIMITS.FREE[feature]) return null;
    if (PLAN_LIMITS.PRO[feature]) return 'pro';
    if (PLAN_LIMITS.PREMIUM[feature]) return 'premium';
    return null;
}

/** Structured error from the backend when a plan limit is hit. */
export interface PlanLimitError {
    statusCode: 403;
    code: 'PLAN_LIMIT_REACHED' | 'FEATURE_NOT_AVAILABLE';
    feature: string;
    current?: number;
    limit?: number;
    currentPlan: 'FREE' | 'PRO' | 'PREMIUM';
    requiredPlan: 'PRO' | 'PREMIUM';
    message: string;
}
