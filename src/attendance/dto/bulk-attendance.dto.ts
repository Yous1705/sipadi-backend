import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, ValidateNested } from 'class-validator';
import { BulkAttendanceItemDto } from './bulk-attendance-item.dto';

export class BulkAttendanceDto {
  @IsInt()
  attendanceSessionId: number;

  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceItemDto)
  @ArrayMinSize(1)
  students: BulkAttendanceItemDto[];
}
