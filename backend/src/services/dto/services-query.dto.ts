import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ServiceChargeType } from '../service.entity';

export class ServicesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ServiceChargeType)
  chargeType?: ServiceChargeType;

  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
