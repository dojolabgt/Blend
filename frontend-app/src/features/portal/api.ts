import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortalQuotation {
    id: string;
    optionName: string;
    isApproved: boolean;
    total: number;
    currency?: string;
}

export interface PortalMilestone {
    id: string;
    name: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    dueDate?: string;
}

export interface PortalDeal {
    id: string;
    publicToken: string;
    status: string;
    createdAt: string;
    workspace: {
        businessName?: string;
        logo?: string;
        brandColor?: string;
    };
    brief?: {
        isCompleted: boolean;
    };
    quotations?: PortalQuotation[];
    paymentPlan?: {
        milestones: PortalMilestone[];
    };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const portalApi = {
    getDeals: (): Promise<PortalDeal[]> =>
        api.get('/portal/deals').then((res) => res.data),
};
