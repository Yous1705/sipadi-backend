import { PartialType } from '@nestjs/mapped-types';
import { AttendSessionDto } from '../../attendance/dto/attend-session.dto';

export class UpdateStudentDto extends PartialType(AttendSessionDto) {}
