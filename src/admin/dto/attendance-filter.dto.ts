import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class AttendanceFilterDto {
  @ApiPropertyOptional({ example: 3, description: 'Filter by class ID' })
  @IsOptional()
  @IsInt()
  classId?: number;

  @ApiPropertyOptional({ example: 99, description: 'Filter by student ID' })
  @IsOptional()
  @IsInt()
  studentId?: number;

  @ApiPropertyOptional({ example: 12, description: 'Filter by teacher ID' })
  @IsOptional()
  @IsInt()
  teacherId?: number;

  @ApiPropertyOptional({ example: 5, description: 'Filter by subject ID' })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({
    example: '2026-01-26T00:00:00.000Z',
    description: 'Filter by date (ISO string recommended)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  date?: Date;
}
