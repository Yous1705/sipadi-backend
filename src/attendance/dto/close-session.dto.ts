import { IsBoolean } from 'class-validator';

export class CloseAttendanceSessionDto {
  @IsBoolean()
  isActive: boolean;
}
