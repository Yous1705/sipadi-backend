import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({
    example: 90,
    minimum: 0,
    maximum: 100,
    description: 'Submission score (0-100)',
  })
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @ApiPropertyOptional({
    example: 'Good work, please improve formatting.',
    description: 'Optional feedback for the student',
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
