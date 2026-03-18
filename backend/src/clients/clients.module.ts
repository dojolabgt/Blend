import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientPortalInvite } from './entities/client-portal-invite.entity';
import { ClientsService } from './clients.service';
import { ClientsController, PublicClientInviteController } from './clients.controller';
import { Workspace } from '../workspaces/workspace.entity';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, ClientPortalInvite, Workspace]),
    WorkspacesModule,
    UsersModule,
  ],
  controllers: [ClientsController, PublicClientInviteController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
