import { AttendanceStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class InputAttendanceByTeacherDto {
  @IsInt()
  teachingAssigmentId: number;

  @IsInt()
  studentId: number;

  @IsDateString()
  date: Date;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
