import { IsInt, IsOptional } from 'class-validator';

export class AssignmentFilterDto {
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
