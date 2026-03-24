import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { Workspace } from '../../workspaces/workspace.entity';
import { User } from '../../users/user.entity';
import { ProjectTaskComment } from './project-task-comment.entity';
import { TaskStatus, TaskPriority } from '../enums/task-status.enum';

@Entity('project_tasks')
@Index(['projectId', 'status'])
export class ProjectTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 512 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  /** Float position for ordering within a column. Higher = further down. */
  @Column({ type: 'float', default: 0 })
  position: number;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: string | null;

  /** Workspace-level assignee: used for project collaborators (external workspaces). */
  @Column({ type: 'uuid', nullable: true, name: 'assignee_workspace_id' })
  assigneeWorkspaceId: string | null;

  @ManyToOne(() => Workspace, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'assignee_workspace_id' })
  assigneeWorkspace: Workspace | null;

  /** User-level assignee: used for members of the owner workspace (including the owner themselves). */
  @Column({ type: 'uuid', nullable: true, name: 'assignee_user_id' })
  assigneeUserId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'assignee_user_id' })
  assigneeUser: User | null;

  @OneToMany(() => ProjectTaskComment, (comment) => comment.task, { cascade: true })
  comments: ProjectTaskComment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
