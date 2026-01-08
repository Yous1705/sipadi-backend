import { IsInt, IsOptional } from 'class-validator';

export class AttendanceFilterDto {
  @IsOptional()
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsOptional()
  date?: Date;
}
