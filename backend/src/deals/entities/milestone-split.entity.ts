import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentMilestone } from './payment-milestone.entity';
import { Workspace } from '../../workspaces/workspace.entity';

export enum SplitStatus {
  ASSIGNED = 'assigned',
  PAID = 'paid',
}

@Entity('milestone_splits')
export class MilestoneSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'milestone_id' })
  milestoneId: string;

  @ManyToOne(() => PaymentMilestone, (milestone) => milestone.splits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'milestone_id' })
  paymentMilestone: PaymentMilestone;

  @Column({ name: 'collaborator_workspace_id' })
  collaboratorWorkspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collaborator_workspace_id' })
  collaboratorWorkspace: Workspace;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: SplitStatus,
    default: SplitStatus.ASSIGNED,
  })
  status: SplitStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
