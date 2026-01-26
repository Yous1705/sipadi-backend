import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AssignHomeroomTeacherDto {
  @ApiProperty({ example: 3, description: 'Class ID' })
  @IsInt()
  classId: number;

  @ApiProperty({ example: 12, description: 'Teacher ID' })
  @IsInt()
  teacherId: number;
}
