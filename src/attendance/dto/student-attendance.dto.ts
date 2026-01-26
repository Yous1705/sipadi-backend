import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class StudentAttendanceDto {
  @ApiProperty({
    example: 77,
    description: 'Attendance session ID',
  })
  @IsInt()
  attendanceSessionId: number;
}
