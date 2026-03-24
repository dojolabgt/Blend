import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/constants/roles';
import { BillingService } from '../billing/billing.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly billingService: BillingService,
    private readonly usersService: UsersService,
  ) {}

  @Post('workspaces/:workspaceId/upgrade')
  @HttpCode(HttpStatus.OK)
  async upgradeWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: { plan: 'pro' | 'premium' },
  ) {
    return this.billingService.devOverridePlan(workspaceId, dto.plan);
  }

  @Patch('users/:id/set-active')
  @HttpCode(HttpStatus.OK)
  async setUserActive(
    @Param('id') id: string,
    @Body() dto: { isActive: boolean },
  ) {
    return this.usersService.setUserActiveStatus(id, dto.isActive);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
