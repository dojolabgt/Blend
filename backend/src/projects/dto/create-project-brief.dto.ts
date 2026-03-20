import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateProjectBriefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsOptional()
  responses?: Record<string, unknown>;
}

export class UpdateProjectBriefDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsObject()
  @IsOptional()
  responses?: Record<string, unknown>;

  @IsOptional()
  isCompleted?: boolean;
}
