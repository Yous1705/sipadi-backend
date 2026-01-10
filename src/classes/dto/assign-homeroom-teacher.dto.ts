import { IsInt } from 'class-validator';

export class AssignHomeroomTeacherDto {
  @IsInt()
  classId: number;

  @IsInt()
  teacherId: number;
}
