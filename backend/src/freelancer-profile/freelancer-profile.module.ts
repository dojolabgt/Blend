import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreelancerProfile } from './freelancer-profile.entity';
import { FreelancerProfileService } from './freelancer-profile.service';
import { FreelancerProfileController } from './freelancer-profile.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FreelancerProfile])],
    providers: [FreelancerProfileService],
    controllers: [FreelancerProfileController],
    exports: [FreelancerProfileService],
})
export class FreelancerProfileModule { }
