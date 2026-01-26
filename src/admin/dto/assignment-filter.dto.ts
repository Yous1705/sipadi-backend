import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class AssignmentFilterDto {
  @ApiPropertyOptional({ example: 3, description: 'Filter by class ID' })
  @IsOptional()
  @IsInt()
  classId?: number;

  @ApiPropertyOptional({ example: 12, description: 'Filter by teacher ID' })
  @IsOptional()
  @IsInt()
  teacherId?: number;

  @ApiPropertyOptional({ example: 5, description: 'Filter by subject ID' })
  @IsOptional()
  @IsInt()
  subjectId?: number;
}
