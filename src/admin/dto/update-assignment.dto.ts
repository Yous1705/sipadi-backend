import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from './create-assignmnet.dto';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}
