import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, IsArray, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../enums/task-status.enum';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  assigneeWorkspaceId?: string;

  @IsOptional()
  @IsUUID()
  assigneeUserId?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsUUID()
  assigneeWorkspaceId?: string | null;

  @IsOptional()
  @IsUUID()
  assigneeUserId?: string | null;

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class ReorderTaskDto {
  @IsUUID()
  id: string;

  @IsNumber()
  position: number;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}

export class ReorderTasksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTaskDto)
  tasks: ReorderTaskDto[];
}

export class CreateTaskCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}
