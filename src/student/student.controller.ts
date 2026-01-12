import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { SubmissionService } from 'src/submission/submission.service';
import { SubmitAssignmentDto } from 'src/submission/dto/submit-assignment.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { AttendSessionDto } from '../attendance/dto/attend-session.dto';
import { StudentAttendanceDto } from 'src/attendance/dto/student-attendance.dto';
import { AttendanceService } from 'src/attendance/attendance.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('student')
export class StudentController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly studentService: StudentService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // ============== ASSIGNMENT ==============

  @Post('assignments/submission')
  submitAssignment(@Body() dto: SubmitAssignmentDto, @Req() req) {
    return this.submissionService.submit(dto, req.user.sub);
  }

  // @Put('assignments/submission')
  // updateSubmission(@Body() dto: SubmitAssignmentDto, @Req() req) {
  //   return this.submissionService.submit(dto, req.user.sub);
  // }

  @Get('dashboard')
  getDashboard(@Req() req) {
    return this.studentService.getDashboard(req.user.sub);
  }

  @Get('assignments')
  getAssignments(@Req() req) {
    return this.studentService.getAssignments(req.user.sub);
  }

  @Get('assignments/:id')
  getAssignmentDetail(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.studentService.getAssignmentsDetail(req.user.sub, id);
  }

  @Get('attendances')
  getAttendances(@Req() req) {
    return this.studentService.getMyAttendances(req.user.sub);
  }

  @Post('attendance/session')
  attendSessions(@Req() req, @Body() dto: AttendSessionDto) {
    return this.studentService.attendSession(req.user.sub, dto);
  }

  @Post('attendance')
  attend(@Body() dto: StudentAttendanceDto, @Req() req) {
    return this.attendanceService.studentAttend(dto, req.user.sub);
  }
}
