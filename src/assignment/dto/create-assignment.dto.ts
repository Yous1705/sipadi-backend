import { SubmissionPolicy } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: Date;

  @IsOptional()
  @IsEnum(SubmissionPolicy)
  submissionPolicy?: SubmissionPolicy;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  maxFileSizeMb?: number;

  @IsInt()
  teachingAssigmentId: number;
}
