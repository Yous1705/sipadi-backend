import { IsInt, IsOptional } from 'class-validator';

export class SubmissionFilterDto {
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsInt()
  subjectId?: number;
}
