import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsString } from 'class-validator';

export class OpenAttendanceSessionDto {
  @ApiProperty({ example: 4, description: 'Teaching assignment ID' })
  @IsInt()
  teachingAssigmentId: number;

  @ApiProperty({ example: 'Session 1', description: 'Attendance session name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '2026-01-26T08:00:00.000Z',
    description: 'Open time (ISO 8601)',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  openAt: string;

  @ApiProperty({
    example: '2026-01-26T10:00:00.000Z',
    description: 'Close time (ISO 8601)',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  closeAt: string;
}
