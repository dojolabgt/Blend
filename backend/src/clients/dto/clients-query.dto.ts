import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ClientType } from '../client.entity';

export class ClientsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;
}
