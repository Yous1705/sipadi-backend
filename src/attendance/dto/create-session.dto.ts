import { IsDateString, IsInt } from 'class-validator';

export class CreateAttendanceSessionDto {
  @IsInt()
  teachingAssigmentId: number;

  @IsDateString()
  openAt: string;

  @IsDateString()
  closedAt: string;
}
