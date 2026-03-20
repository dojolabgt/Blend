import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { BriefTemplate } from '../../deals/entities/brief-template.entity';

@Entity('project_briefs')
export class ProjectBrief {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.briefs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  name: string;

  @Column({ type: 'uuid', name: 'template_id', nullable: true })
  templateId: string | null;

  @ManyToOne(() => BriefTemplate, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: BriefTemplate | null;

  /**
   * Snapshot of the template schema at creation time.
   * Stored so that brief questions remain legible even if template changes.
   * Format: [{ id, label, type, options?, required? }]
   */
  @Column({ type: 'jsonb', default: [], name: 'template_snapshot' })
  templateSnapshot: { id: string; label: string; type: string; options?: string[]; required?: boolean }[];

  /** { fieldId: answerValue } */
  @Column({ type: 'jsonb', default: {} })
  responses: Record<string, unknown>;

  @Column({ default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
