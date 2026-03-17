import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const RECURRENTE_API = 'https://app.recurrente.com/api';

/**
 * Prices in USD cents for each plan/interval.
 * Defaults: Pro $19/month, $190/year (~$15.83/mo, save 2 months)
 *           Premium $39/month, $390/year (~$32.50/mo, save 2 months)
 * Override via BILLING_PRO_MONTHLY_CENTS / BILLING_PRO_YEARLY_CENTS /
 *              BILLING_PREMIUM_MONTHLY_CENTS / BILLING_PREMIUM_YEARLY_CENTS
 */
const DEFAULT_PRO_MONTHLY_CENTS = 1900;
const DEFAULT_PRO_YEARLY_CENTS = 19000;
const DEFAULT_PREMIUM_MONTHLY_CENTS = 3900;
const DEFAULT_PREMIUM_YEARLY_CENTS = 39000;

interface RecurrenteCheckoutResponse {
  id: string;
  checkout_url: string;
}

@Injectable()
export class RecurrenteHiKrewService {
  private readonly logger = new Logger(RecurrenteHiKrewService.name);
  private readonly publicKey: string;
  private readonly secretKey: string;
  private readonly proMonthlyCents: number;
  private readonly proYearlyCents: number;
  private readonly premiumMonthlyCents: number;
  private readonly premiumYearlyCents: number;

  constructor(private readonly configService: ConfigService) {
    this.publicKey = this.configService.getOrThrow<string>(
      'KREW_RECURRENTE_PUBLIC_KEY',
    );
    this.secretKey = this.configService.getOrThrow<string>(
      'KREW_RECURRENTE_SECRET_KEY',
    );
    this.proMonthlyCents =
      this.configService.get<number>('BILLING_PRO_MONTHLY_CENTS') ??
      DEFAULT_PRO_MONTHLY_CENTS;
    this.proYearlyCents =
      this.configService.get<number>('BILLING_PRO_YEARLY_CENTS') ??
      DEFAULT_PRO_YEARLY_CENTS;
    this.premiumMonthlyCents =
      this.configService.get<number>('BILLING_PREMIUM_MONTHLY_CENTS') ??
      DEFAULT_PREMIUM_MONTHLY_CENTS;
    this.premiumYearlyCents =
      this.configService.get<number>('BILLING_PREMIUM_YEARLY_CENTS') ??
      DEFAULT_PREMIUM_YEARLY_CENTS;
  }

  private get authHeaders(): Record<string, string> {
    return {
      'X-PUBLIC-KEY': this.publicKey,
      'X-SECRET-KEY': this.secretKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Creates a Recurrente subscription checkout using Krew's own keys.
   * All checkouts carry metadata { workspaceId, context: 'krew_billing' }
   * so the webhook handler can route the event correctly.
   */
  async createSubscriptionCheckout(
    workspaceId: string,
    planType: 'pro' | 'premium',
    isAnnual: boolean,
    successUrl: string,
    cancelUrl: string,
  ): Promise<RecurrenteCheckoutResponse> {
    const isMonthly = !isAnnual;
    const amountInCents = isMonthly
      ? (planType === 'premium' ? this.premiumMonthlyCents : this.proMonthlyCents)
      : (planType === 'premium' ? this.premiumYearlyCents : this.proYearlyCents);

    const itemName =
      planType === 'premium'
        ? `Krew Premium — ${isMonthly ? 'Mensual' : 'Anual'}`
        : `Krew Pro — ${isMonthly ? 'Mensual' : 'Anual'}`;

    const payload = {
      items: [
        {
          name: itemName,
          description:
            'Acceso completo a Krew: clientes ilimitados, cotizaciones ilimitadas y más.',
          currency: 'USD',
          amount_in_cents: amountInCents,
          charge_type: 'recurring',
          billing_interval: isMonthly ? 'month' : 'year',
          billing_interval_count: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      custom_info: {
        workspaceId,
        context: 'krew_billing',
        plan: planType,
      },
    };

    try {
      const res = await fetch(`${RECURRENTE_API}/checkouts`, {
        method: 'POST',
        headers: this.authHeaders,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Recurrente checkout error: ${res.status} ${text}`);
        throw new InternalServerErrorException(
          'No se pudo crear el checkout de suscripción',
        );
      }

      return res.json() as Promise<RecurrenteCheckoutResponse>;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Network error creating Recurrente checkout', error);
      throw new InternalServerErrorException(
        'No se pudo crear el checkout de suscripción',
      );
    }
  }

  /**
   * Cancels an active Recurrente subscription.
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const res = await fetch(
        `${RECURRENTE_API}/subscriptions/${subscriptionId}`,
        {
          method: 'DELETE',
          headers: this.authHeaders,
        },
      );

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Recurrente cancel error: ${res.status} ${text}`);
        throw new InternalServerErrorException(
          'No se pudo cancelar la suscripción',
        );
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(
        `Network error cancelling subscription ${subscriptionId}`,
        error,
      );
      throw new InternalServerErrorException(
        'No se pudo cancelar la suscripción',
      );
    }
  }

  get prices() {
    return {
      pro: {
        monthly: this.proMonthlyCents,
        yearly: this.proYearlyCents,
      },
      premium: {
        monthly: this.premiumMonthlyCents,
        yearly: this.premiumYearlyCents,
      },
    };
  }
}
