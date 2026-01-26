import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AssignTeacherDto {
  @ApiProperty({ example: 12, description: 'Teacher ID' })
  @IsInt()
  teacherId: number;

  @ApiProperty({ example: 3, description: 'Class ID' })
  @IsInt()
  classId: number;

  @ApiProperty({ example: 5, description: 'Subject ID' })
  @IsInt()
  subjectId: number;
}
