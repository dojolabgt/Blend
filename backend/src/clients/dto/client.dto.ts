import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientType } from '../client.entity';

class TaxIdentifierDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class CreateClientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  linkedUserId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxIdentifierDto)
  taxIdentifiers?: TaxIdentifierDto[];

  @IsOptional()
  @IsObject()
  address?: Record<string, string>;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  linkedUserId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxIdentifierDto)
  taxIdentifiers?: TaxIdentifierDto[];

  @IsOptional()
  @IsObject()
  address?: Record<string, string>;
}
