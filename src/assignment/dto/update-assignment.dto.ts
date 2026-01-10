import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from '../../assignment/dto/create-assignment.dto';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}
