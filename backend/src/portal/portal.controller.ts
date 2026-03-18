import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalService } from './portal.service';
import type { AuthRequest } from '../common/types/auth-request';

@Controller('portal')
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  /**
   * GET /portal/deals
   * Returns deals visible to the authenticated CLIENT user.
   */
  @Get('deals')
  getMyDeals(@Req() req: AuthRequest) {
    return this.portalService.getDealsForUser(req.user.id);
  }
}
