import { IsDateString, IsInt } from 'class-validator';

export class OpenAttendanceSessionDto {
  @IsInt()
  teachingAssigmentId: number;

  @IsDateString()
  openAt: string;

  @IsDateString()
  closeAt: string;
}
