import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, ValidateNested } from 'class-validator';
import { BulkAttendanceItemDto } from './bulk-attendance-item.dto';

export class BulkAttendanceDto {
  @ApiProperty({ example: 77, description: 'Attendance session ID' })
  @IsInt()
  attendanceSessionId: number;

  @ApiProperty({
    type: () => [BulkAttendanceItemDto],
    description: 'List of student attendance updates (min 1)',
  })
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceItemDto)
  @ArrayMinSize(1)
  students: BulkAttendanceItemDto[];
}
