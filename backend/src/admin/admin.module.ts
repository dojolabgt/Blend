import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { BillingModule } from '../billing/billing.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BillingModule, UsersModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
