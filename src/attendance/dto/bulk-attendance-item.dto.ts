import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class BulkAttendanceItemDto {
  @ApiProperty({ example: 99, description: 'Student ID' })
  @IsInt()
  studentId: number;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.HADIR,
    description: 'Attendance status',
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({
    example: 'Sick',
    description: 'Optional note',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
