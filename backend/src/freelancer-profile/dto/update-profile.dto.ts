import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';

export class UpdateFreelancerProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    businessName?: string;

    @IsOptional()
    @IsString()
    logo?: string;

    @IsOptional()
    @IsHexColor()
    brandColor?: string;
}
