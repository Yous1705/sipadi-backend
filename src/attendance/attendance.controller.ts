import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CreateAttendanceSessionDto } from './dto/create-session.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('session')
  createSession(@Body() dto: CreateAttendanceSessionDto) {
    return this.attendanceService.createSession(dto);
  }

  @Put('session/:id/close')
  closeSession(@Param('id') id: number) {
    return this.attendanceService.closeSession(id);
  }

  @Post()
  createAttendance(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.createAttendance(dto, {
      id: 1,
      role: 'TEACHER',
    });
  }

  @Put(':id')
  updateAttendance(@Param('id') id: number, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(+id, dto);
  }
}
