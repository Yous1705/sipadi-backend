import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceSessionDto {
  @ApiPropertyOptional({
    example: '2026-01-26T08:00:00.000Z',
    description: 'Open time (ISO 8601)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  openAt?: Date;

  @ApiProperty({
    example: 'Session 1 - Updated',
    description: 'Attendance session name',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '2026-01-26T10:00:00.000Z',
    description: 'Close time (ISO 8601)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  closeAt?: Date;
}
