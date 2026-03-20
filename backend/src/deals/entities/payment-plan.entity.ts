import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Deal } from './deal.entity';
import { Quotation } from './quotation.entity';
import { PaymentMilestone } from './payment-milestone.entity';

@Entity('payment_plans')
export class PaymentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Null for standalone project payment plans. */
  @Column({ type: 'uuid', name: 'deal_id', nullable: true })
  dealId: string | null;

  @OneToOne(() => Deal, (deal) => deal.paymentPlan, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal | null;

  /** Set for standalone projects (no deal). Unique constraint enforces one plan per project. */
  @Column({ type: 'uuid', name: 'project_id', nullable: true, unique: true })
  projectId: string | null;

  // Cualesquiera de la cotizaciones del trato que sea aprobada
  @Column({ type: 'uuid', name: 'quotation_id', nullable: true })
  quotationId: string;

  @OneToOne(() => Quotation, (quotation) => quotation.paymentPlan, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  // ─── Stripe preparation (integration not yet active) ──────────────────────

  /** Billing cadence: determines how Stripe subscription is configured when integrated. */
  @Column({ type: 'varchar', name: 'billing_cycle', nullable: true })
  billingCycle: 'one_time' | 'monthly' | 'quarterly' | 'annual' | null;

  /** Stripe subscription ID — populated when Stripe integration is active. */
  @Column({ type: 'varchar', name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId: string | null;

  /** Stripe Price ID linked to the billing cycle. */
  @Column({ type: 'varchar', name: 'stripe_price_id', nullable: true })
  stripePriceId: string | null;

  /** Stripe Payment Method ID attached by client. */
  @Column({ type: 'varchar', name: 'stripe_payment_method_id', nullable: true })
  stripePaymentMethodId: string | null;

  // ─────────────────────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PaymentMilestone, (milestone) => milestone.paymentPlan, {
    cascade: true,
  })
  milestones: PaymentMilestone[];
}
