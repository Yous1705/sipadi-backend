import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentByTeacherDto } from './create-assignment.dto';

export class UpdateAssignmentByTeacherDto extends PartialType(
  CreateAssignmentByTeacherDto,
) {}
