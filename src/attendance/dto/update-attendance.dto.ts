import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    enum: AttendanceStatus,
    example: AttendanceStatus.HADIR,
    description: 'Attendance status',
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({
    example: 'Late due to traffic',
    description: 'Attendance note',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
