import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';

export enum ClientType {
  PERSON = 'person',
  COMPANY = 'company',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace)
  workspace: Workspace;

  @Column({ nullable: true })
  linkedUserId: string;

  // ─── Datos básicos ────────────────────────────────────────────────────────

  @Column()
  name: string;

  @Index()
  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // ─── Localización ─────────────────────────────────────────────────────────

  @Column({ nullable: true })
  country: string; // ISO code: 'GT', 'US', etc.

  @Column({
    type: 'enum',
    enum: ClientType,
    default: ClientType.PERSON,
  })
  type: ClientType;

  // ─── Campos dinámicos por país (jsonb) ────────────────────────────────────

  /**
   * Identificadores fiscales del cliente según su país.
   * Ej: [{ key: 'nit', value: '1234567-8' }, { key: 'cui', value: '...' }]
   * Las claves disponibles están definidas en pais.json[country].taxIdentifiers
   */
  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  taxIdentifiers: { key: string; value: string }[];

  /**
   * Dirección estructurada según el formato del país del cliente.
   * Ej GT: { street: '6a Av 12-34', zona: 'Zona 10', municipio: 'Guatemala', departamento: 'Guatemala' }
   * Ej US: { street: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' }
   */
  @Column({ type: 'jsonb', nullable: true })
  address: Record<string, string>;

  // ─── Timestamps ───────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
