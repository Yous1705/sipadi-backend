import { IsInt } from 'class-validator';

export class AssignTeacherDto {
  @IsInt()
  teacherId: number;

  @IsInt()
  classId: number;

  @IsInt()
  subjectId: number;
}
