import api from '@/lib/api';
import {
    BillingStatus,
    BillingSubscription,
    SubscribeResponse,
    BillingInterval,
} from './types';

export const billingApi = {
    /**
     * Returns the current plan, planExpiresAt, active subscription, and prices.
     */
    getStatus: async (): Promise<BillingStatus> => {
        const response = await api.get<BillingStatus>('/billing/status');
        return response.data;
    },

    /**
     * Creates a Recurrente subscription checkout.
     * Returns the checkout URL to redirect the user.
     */
    subscribe: async (plan: 'pro' | 'premium', interval: BillingInterval): Promise<SubscribeResponse> => {
        const response = await api.post<SubscribeResponse>('/billing/subscribe', { plan, interval });
        return response.data;
    },

    /**
     * [DEV ONLY] Instantly switches plan without checkout
     */
    devOverride: async (plan: 'pro' | 'premium'): Promise<{ success: boolean }> => {
        const response = await api.post<{ success: boolean }>('/billing/dev-override', { plan });
        return response.data;
    },

    /**
     * Cancels the active subscription.
     */
    cancel: async (): Promise<void> => {
        await api.post('/billing/cancel');
    },

    /**
     * Verifies a checkout with Recurrente and activates the subscription if paid.
     * Fallback for when the webhook doesn't fire (e.g. local development).
     */
    verifyCheckout: async (checkoutId: string): Promise<{ alreadyActive: boolean }> => {
        const response = await api.get<{ alreadyActive: boolean }>(`/billing/verify-checkout?checkout_id=${checkoutId}`);
        return response.data;
    },

    /**
     * Returns the billing history for the authenticated freelancer.
     */
    getHistory: async (): Promise<BillingSubscription[]> => {
        const response = await api.get<BillingSubscription[]>('/billing/history');
        return response.data;
    },
};
