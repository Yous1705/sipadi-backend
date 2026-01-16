import { IsDateString, IsInt, IsString } from 'class-validator';

export class OpenAttendanceSessionDto {
  @IsInt()
  teachingAssigmentId: number;

  @IsString()
  name: string;

  @IsDateString()
  openAt: string;

  @IsDateString()
  closeAt: string;
}
