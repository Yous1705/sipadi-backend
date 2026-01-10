import { IsInt } from 'class-validator';

export class CloseAttendanceSessionDto {
  @IsInt()
  sessionId: number;
}
