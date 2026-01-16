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
  Query,
  Res,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
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
import { UpdateAttendanceSessionDto } from 'src/attendance-session/dto/update-attendance.dto';
import { ReportService } from 'src/report/report.service';

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
    private readonly reportService: ReportService,
  ) {}

  // ======================
  // Assignments
  // ======================
  @Post('assignments')
  createAssignment(@Body() dto: CreateAssignmentDto, @Req() req) {
    return this.assignmentService.create(dto, req.user.sub);
  }

  @Patch('assignments/:id')
  updateAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
    @Req() req,
  ) {
    return this.assignmentService.updateAssignment(id, dto, req.user.sub);
  }

  @Get('assignments')
  findMyAssignments(
    @Req() req,
    @Query('teachingAssigmentId') teachingAssigmentId: number,
  ) {
    return this.assignmentService.findMyAssignmentsByClass(
      req.user.sub,
      teachingAssigmentId,
    );
  }

  @Get('assignments/:id')
  findAssignmentById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.findAssignmentById(id, req.user.sub);
  }

  @Get('assignments/:id/detail')
  getAssignmentDetail(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.getAssignmentDetail(id, req.user.sub);
  }

  @Patch('assignments/:id/publish')
  publishAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.publish(id, req.user.sub);
  }

  @Patch('assignments/:id/close')
  closeAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.close(id, req.user.sub);
  }

  // Soft delete (recommended)
  @Delete('assignments/:id')
  deleteAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.delete(id, req.user.sub);
  }

  // Hard delete (dangerous)
  @Delete('assignments/:id/hard')
  hardDeleteAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.hardDelete(id, req.user.sub);
  }

  @Get('assignments/:id/submissions')
  getSubmission(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.teacherService.getSubmission(id, req.user.sub);
  }

  // ======================
  // Submissions
  // ======================
  @Patch('submissions/:id/grade')
  gradeSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GradeSubmissionDto,
    @Req() req,
  ) {
    return this.submissionService.gradeSubmission(id, dto, req.user.sub);
  }

  @Patch('submissions/:id/reset-grade')
  resetGrade(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.submissionService.resetGrade(id, req.user.sub);
  }

  // ======================
  // Reports
  // ======================
  @Get('reports/teaching/:id/grades')
  getGradeReport(@Param('id', ParseIntPipe) teachingId: number, @Req() req) {
    return this.reportService.getGradeReport(teachingId, req.user.sub);
  }

  @Get('reports/teaching/:id/grades/export')
  async exportGradeReport(
    @Param('id', ParseIntPipe) teachingId: number,
    @Query('format') format: 'csv' | 'xlsx',
    @Req() req,
    @Res() res,
  ) {
    const result = await this.submissionService.exportGradeReport(
      teachingId,
      req.user.sub,
      format ?? 'csv',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.setHeader('Content-Type', result.mimeType);

    res.send(result.content);
  }

  @Get('reports/class/:id/export')
  exportClassReport(
    @Param('id', ParseIntPipe) classId: number,
    @Query('format') format: 'csv' | 'xlsx',
    @Req() req,
    @Res() res,
  ) {
    return this.reportService.exportClassReport(
      classId,
      req.user.sub,
      format ?? 'xlsx',
      res,
    );
  }

  @Get('reports/class/:id')
  getClassReport(@Param('id', ParseIntPipe) classId: number, @Req() req) {
    return this.reportService.getClassSummaryReport(classId, req.user.sub);
  }

  // ======================
  // Teachings
  // ======================
  @Get('teachings')
  getMyTeaching(@Req() req) {
    return this.teacherService.getMyTeaching(req.user.sub);
  }

  @Get('teachings/:id/students')
  getStudents(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.teacherService.getStudents(id, req.user.sub);
  }

  @Get('teachings/:id/assignment')
  getAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.teacherService.getAssignment(id, req.user.sub);
  }

  @Get('homeroom/class')
  getHomeroomClass(@Req() req) {
    return this.teacherService.getHomeroomClass(req.user.sub);
  }

  // ======================
  // Attendance Sessions
  // ======================
  @Post('attendance-sessions')
  openSession(@Body() dto: OpenAttendanceSessionDto, @Req() req) {
    return this.attendanceSessionService.open(dto, req.user.sub);
  }

  @Delete('attendance-sessions/:id')
  deleteSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.deleteSession(id, req.user.sub);
  }

  @Patch('attendance-sessions/:id/close')
  closeSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.close(id, req.user.sub);
  }

  @Get('attendance-sessions/teaching/:id')
  listSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.listByTeaching(id, req.user.sub);
  }

  @Get('attendance-sessions/:id/detail')
  getDetailWithStudent(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.getDetailWithStudent(id, req.user.sub);
  }

  @Get('attendance-sessions/:id/attendances')
  getSessionAttendances(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.listBySession(id);
  }

  @Get('attendance-sessions/teaching/:id/progress')
  getAttendanceSessionsProgress(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.attendanceSessionService.getAttendanceSessions(
      id,
      req.user.sub,
    );
  }

  @Patch('attendance-sessions/:id')
  updateAttendanceSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceSessionDto,
    @Req() req,
  ) {
    return this.attendanceSessionService.updateAttendanceSession(
      id,
      dto,
      req.user.sub,
    );
  }

  // ======================
  // Attendances
  // ======================
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
