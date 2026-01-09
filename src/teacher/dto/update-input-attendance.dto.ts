import { PartialType } from '@nestjs/mapped-types';
import { InputAttendanceByTeacherDto } from './input-attendance.dto';

export class UpdateInputAttendanceByTeacherDto extends PartialType(
  InputAttendanceByTeacherDto,
) {}
