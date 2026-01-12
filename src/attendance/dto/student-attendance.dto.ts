import { IsInt } from 'class-validator';

export class StudentAttendanceDto {
  @IsInt()
  attendanceSessionId: number;
}
