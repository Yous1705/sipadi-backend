import { PartialType } from '@nestjs/mapped-types';
import { SubmitAssignmentDto } from './submit-assignment.dto';

export class UpdateSubmissionDto extends PartialType(SubmitAssignmentDto) {}
