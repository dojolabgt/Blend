import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DealStatus } from '../enums/deal-status.enum';

export class DealsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}

export class BriefTemplatesQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
