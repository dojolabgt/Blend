import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FreelancerProfileService } from './freelancer-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/constants/roles';
import { UpdateFreelancerProfileDto } from './dto/update-profile.dto';
import { UpdateRecurrenteKeysDto } from './dto/update-recurrente-keys.dto';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FREELANCER)
export class FreelancerProfileController {
    constructor(private readonly profileService: FreelancerProfileService) { }

    @Get('profile')
    getProfile(@Req() req: RequestWithUser) {
        return this.profileService.findByUserId(req.user!.id);
    }

    @Patch('profile')
    updateProfile(
        @Req() req: RequestWithUser,
        @Body() dto: UpdateFreelancerProfileDto,
    ) {
        return this.profileService.update(req.user!.id, dto);
    }

    @Patch('recurrente-keys')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateRecurrenteKeys(
        @Req() req: RequestWithUser,
        @Body() dto: UpdateRecurrenteKeysDto,
    ) {
        await this.profileService.updateRecurrenteKeys(req.user!.id, dto);
    }

    @Get('recurrente-status')
    getRecurrenteStatus(@Req() req: RequestWithUser) {
        return this.profileService.getRecurrenteStatus(req.user!.id);
    }
}
