import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { CreateAssignmentByTeacherDto } from './dto/create-assignment.dto';
import { UpdateAssignmentByTeacherDto } from './dto/update-assignment.dto';
import { InputAttendanceByTeacherDto } from './dto/input-attendance.dto';
import { UpdateInputAttendanceByTeacherDto } from './dto/update-input-attendance.dto';
import { GradeSubmissionDto } from '../submission/dto/create-grade-submission.dto';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CreateAssignmentDto } from 'src/assignment/dto/create-assignment.dto';
import { UpdateAssignmentDto } from 'src/assignment/dto/update-assignment.dto';
import { AttendanceSessionService } from 'src/attendance-session/attendance-session.service';
import { OpenAttendanceSessionDto } from 'src/attendance-session/dto/open-session.dto';
import { AttendanceService } from 'src/attendance/attendance.service';
import { UpdateAttendanceDto } from 'src/attendance/dto/update-attendance.dto';
import { BulkAttendanceDto } from 'src/attendance/dto/bulk-attendance.dto';
import { SubmissionService } from 'src/submission/submission.service';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class TeacherController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly teacherService: TeacherService,
    private readonly attendanceSessionService: AttendanceSessionService,
    private readonly attendanceService: AttendanceService,
    private readonly submissionService: SubmissionService,
  ) {}

  // ============= Assignment =============
  @Post('assignment')
  createAssignment(@Body() dto: CreateAssignmentDto, @Req() req) {
    return this.assignmentService.create(dto, req.user.sub);
  }

  @Patch('assignments/:id')
  updateAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
    @Req() req,
  ) {
    return this.assignmentService.update(id, dto, req.user.sub);
  }

  @Get('assignments')
  findMyAssignments(@Req() req) {
    return this.assignmentService.findMyAssignments(req.user.sub);
  }

  @Patch('assignments/:id/publish')
  publishAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.publish(id, req.user.sub);
  }

  @Patch('assignments/:id/close')
  closeAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.close(id, req.user.sub);
  }

  @Delete('assignments/:id')
  deleteAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.delete(id, req.user.sub);
  }

  @Get('assignments/:id/submissions')
  getSubmission(@Param('id', ParseIntPipe) Id: number, @Req() req) {
    return this.teacherService.getSubmission(Id, req.user.sub);
  }

  @Patch('submission/:id/grade')
  gradeSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GradeSubmissionDto,
    @Req() req,
  ) {
    return this.submissionService.gradeSubmission(id, dto, req.user.sub);
  }

  // =========== TEACHINGS ================

  @Get('teachings')
  getMyTeaching(@Req() req) {
    return this.teacherService.getMyTeaching(req.user.sub);
  }

  @Get('teachings/:id/students')
  getStudents(@Param('id', ParseIntPipe) Id: number, @Req() req) {
    return this.teacherService.getStudents(Id, req.user.sub);
  }

  @Get('teachings/:id/assignment')
  getAssignment(@Param('id', ParseIntPipe) Id: number, @Req() req) {
    return this.teacherService.getAssignment(Id, req.user.sub);
  }

  // ============== ATTENDANCE SESSION ==============
  @Post('attendance-session')
  openSession(@Body() dto: OpenAttendanceSessionDto) {
    return this.attendanceSessionService.open(dto);
  }

  @Patch('attendance-session/:id/close')
  closeSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.close(id, req.user.sub);
  }

  @Get('attendance-session/teaching/:id')
  listSession(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceSessionService.listByTeaching(id);
  }

  @Get('attendance-session/:id')
  sessionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceSessionService.detail(id);
  }

  @Get('attendance-session/:id/attendances')
  getSessionAttendances(@Param('id') id: number) {
    return this.attendanceService.listBySession(id);
  }
  @Patch('attendances/:id')
  updateAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
    @Req() req,
  ) {
    return this.attendanceService.teacherUpdateAttendance(
      id,
      dto,
      req.user.sub,
    );
  }

  @Post('attendances/bulk')
  bulkAttendance(@Body() dto: BulkAttendanceDto, @Req() req) {
    return this.attendanceService.bulkCreateAttendance(dto, req.user.sub);
  }
}
