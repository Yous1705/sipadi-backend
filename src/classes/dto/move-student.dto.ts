import { IsInt } from 'class-validator';

export class MoveStudentDto {
  @IsInt()
  studentId: number;

  @IsInt()
  classId: number;
}
