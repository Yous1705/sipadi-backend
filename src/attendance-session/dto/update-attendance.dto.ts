import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceSessionDto {
  @IsOptional()
  @IsDateString()
  openAt?: Date;

  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  closeAt?: Date;
}
