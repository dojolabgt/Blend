import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Deal } from './deal.entity';
import { Workspace } from '../../workspaces/workspace.entity';

export enum CollaboratorRole {
    VIEWER = 'viewer',
    EDITOR = 'editor',
}

@Entity('deal_collaborators')
export class DealCollaborator {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'deal_id' })
    dealId: string;

    @ManyToOne(() => Deal, (deal) => deal.collaborators, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deal_id' })
    deal: Deal;

    @Column({ name: 'workspace_id' })
    workspaceId: string;

    @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspace_id' })
    workspace: Workspace;

    @Column({
        type: 'enum',
        enum: CollaboratorRole,
        default: CollaboratorRole.VIEWER,
    })
    role: CollaboratorRole;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
