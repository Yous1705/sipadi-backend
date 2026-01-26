import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 'Chapter 1 Homework',
    minLength: 3,
    description: 'Assignment title',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({
    example: 'Solve questions 1-10 and submit before due date.',
    description: 'Optional assignment description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2026-01-30T13:00:00.000Z',
    description: 'Due date (ISO 8601 date-time string)',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  dueDate: Date;

  @ApiPropertyOptional({
    enum: SubmissionPolicy,
    example: SubmissionPolicy.FILE_ONLY,
    description: 'Submission policy (optional)',
  })
  @IsOptional()
  @IsEnum(SubmissionPolicy)
  submissionPolicy?: SubmissionPolicy;

  @ApiPropertyOptional({
    example: 2,
    minimum: 1,
    maximum: 10,
    description: 'Max file size in MB (optional, 1-10)',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  maxFileSizeMb?: number;

  @ApiProperty({
    example: 4,
    description: 'Teaching assignment ID',
  })
  @IsInt()
  teachingAssigmentId: number;
}
