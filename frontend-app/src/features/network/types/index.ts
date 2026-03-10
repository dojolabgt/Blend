import { Workspace } from '@/features/workspaces/types';

export enum ConnectionStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

export interface WorkspaceConnection {
    id: string;
    inviterWorkspaceId: string;
    inviterWorkspace: Workspace;
    inviteeWorkspaceId?: string;
    inviteeWorkspace?: Workspace;
    inviteEmail: string;
    token: string;
    status: ConnectionStatus;
    createdAt: string;
    updatedAt: string;
}

export interface NetworkData {
    active: WorkspaceConnection[];
    pendingSent: WorkspaceConnection[];
}
