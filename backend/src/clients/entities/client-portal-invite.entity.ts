import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from '../client.entity';

@Entity('client_portal_invites')
export class ClientPortalInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Index()
  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: () => 'NULL' })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
