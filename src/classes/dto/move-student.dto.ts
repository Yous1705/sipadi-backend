import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class MoveStudentDto {
  @ApiProperty({ example: 99, description: 'Student ID' })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 3, description: 'Target Class ID' })
  @IsInt()
  classId: number;
}
