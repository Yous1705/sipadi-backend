import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class AttendSessionDto {
  @ApiProperty({
    example: 77,
    description: 'Attendance session ID',
  })
  @IsInt()
  attendanceSessionId: number;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.HADIR,
    description: 'Attendance status',
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({
    example: 'Late due to traffic',
    description: 'Optional note from student',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
