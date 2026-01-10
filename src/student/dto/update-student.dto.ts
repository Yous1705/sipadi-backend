import { PartialType } from '@nestjs/mapped-types';
import { AttendSessionDto } from './attend-session.dto';

export class UpdateStudentDto extends PartialType(AttendSessionDto) {}
