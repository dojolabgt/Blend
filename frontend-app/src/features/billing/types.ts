export type BillingInterval = 'month' | 'year';
export type BillingSubscriptionStatus =
    | 'pending'
    | 'active'
    | 'past_due'
    | 'cancelled'
    | 'unable_to_start';

export interface BillingSubscription {
    id: string;
    freelancerId: string;
    recurrenteCheckoutId: string;
    recurrenteSubscriptionId: string | null;
    interval: BillingInterval;
    status: BillingSubscriptionStatus;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PlanPrices {
    monthly: number; // USD cents
    yearly: number;  // USD cents
}

export interface BillingStatus {
    plan: 'free' | 'pro' | 'premium';
    planExpiresAt: string | null;
    subscription: BillingSubscription | null;
    prices: {
        pro: PlanPrices;
        premium: PlanPrices;
    };
}

export interface SubscribeResponse {
    checkoutUrl: string;
}
