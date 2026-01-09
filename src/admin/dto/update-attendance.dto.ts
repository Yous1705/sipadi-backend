import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './ccreate-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
