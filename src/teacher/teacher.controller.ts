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
import type { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProduces,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Teacher')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized (missing/invalid JWT)' })
@ApiForbiddenResponse({ description: 'Forbidden (not a Teacher)' })
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

  // ======================================
  // Assignments
  // ======================

  @ApiOperation({ summary: 'Create assignment' })
  @ApiCreatedResponse({ description: 'Assignment created' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: CreateAssignmentDto })
  @Post('assignments')
  createAssignment(@Body() dto: CreateAssignmentDto, @Req() req) {
    return this.assignmentService.create(dto, req.user.sub);
  }

  @ApiOperation({ summary: 'Update assignment' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiOkResponse({ description: 'Assignment updated' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @ApiBody({ type: UpdateAssignmentDto })
  @Patch('assignments/:id')
  updateAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
    @Req() req,
  ) {
    return this.assignmentService.updateAssignment(id, dto, req.user.sub);
  }

  @ApiOperation({ summary: 'List my assignments by teaching assignment' })
  @ApiQuery({
    name: 'teachingAssigmentId',
    required: true,
    type: Number,
    example: 4,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Assignments returned' })
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

  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiOkResponse({ description: 'Assignment returned' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Get('assignments/:id')
  findAssignmentById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.findAssignmentById(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Get assignment detail (with submissions etc.)' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiOkResponse({ description: 'Assignment detail returned' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Get('assignments/:id/detail')
  getAssignmentDetail(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.getAssignmentDetail(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Publish assignment' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiOkResponse({ description: 'Assignment published' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Patch('assignments/:id/publish')
  publishAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.publish(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Close assignment' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiOkResponse({ description: 'Assignment closed' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Patch('assignments/:id/close')
  closeAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.close(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Soft delete assignment' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiNoContentResponse({ description: 'Assignment deleted (soft)' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Delete('assignments/:id')
  deleteAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.delete(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Hard delete assignment (dangerous)' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiNoContentResponse({ description: 'Assignment deleted (hard)' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Delete('assignments/:id/hard')
  hardDeleteAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assignmentService.hardDelete(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Get submissions by assignment ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 12,
    description: 'Assignment ID',
  })
  @ApiOkResponse({ description: 'Submissions returned' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Get('assignments/:id/submissions')
  getSubmission(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.teacherService.getSubmission(id, req.user.sub);
  }

  // ======================
  // Submissions
  // =======================

  @ApiOperation({ summary: 'Grade a submission' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 90,
    description: 'Submission ID',
  })
  @ApiOkResponse({ description: 'Submission graded' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiBody({ type: GradeSubmissionDto })
  @Patch('submissions/:id/grade')
  gradeSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GradeSubmissionDto,
    @Req() req,
  ) {
    return this.submissionService.gradeSubmission(id, dto, req.user.sub);
  }

  @ApiOperation({ summary: 'Reset submission grade' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 90,
    description: 'Submission ID',
  })
  @ApiOkResponse({ description: 'Grade reset' })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @Patch('submissions/:id/reset-grade')
  resetGrade(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.submissionService.resetGrade(id, req.user.sub);
  }

  // ======================
  //        Reports
  // ======================

  @ApiOperation({
    summary: 'Get grade report by teaching assignment (teacher)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Grade report returned' })
  @ApiNotFoundResponse({ description: 'Teaching assignment not found' })
  @Get('reports/teaching/:id/grades')
  getGradeReport(@Param('id', ParseIntPipe) teachingId: number, @Req() req) {
    return this.reportService.getGradeReport(teachingId, req.user.sub);
  }

  @ApiOperation({ summary: 'Export grade report (CSV/XLSX)' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['csv', 'xlsx'],
    example: 'csv',
    description: 'Export format (default: csv)',
  })
  @ApiProduces(
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({ description: 'File streamed as response' })
  @ApiBadRequestResponse({ description: 'Invalid format' })
  @Get('reports/teaching/:id/grades/export')
  async exportGradeReport(
    @Param('id', ParseIntPipe) teachingId: number,
    @Query('format') format: 'csv' | 'xlsx',
    @Req() req,
    @Res() res: Response,
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

  @ApiOperation({ summary: 'Export class report (CSV/XLSX)' })
  @ApiParam({ name: 'id', type: Number, example: 3, description: 'Class ID' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['csv', 'xlsx'],
    example: 'xlsx',
    description: 'Export format (default: xlsx)',
  })
  @ApiProduces(
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({ description: 'File streamed as response' })
  @ApiBadRequestResponse({ description: 'Invalid format' })
  @Get('reports/class/:id/export')
  exportClassReport(
    @Param('id', ParseIntPipe) classId: number,
    @Query('format') format: 'csv' | 'xlsx',
    @Req() req,
    @Res() res: Response,
  ) {
    return this.reportService.exportClassReport(
      classId,
      req.user.sub,
      format ?? 'xlsx',
      res,
    );
  }

  @ApiOperation({ summary: 'Get class summary report (teacher / homeroom)' })
  @ApiParam({ name: 'id', type: Number, example: 3, description: 'Class ID' })
  @ApiOkResponse({ description: 'Report returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @Get('reports/class/:id')
  getClassReport(@Param('id', ParseIntPipe) classId: number, @Req() req) {
    return this.reportService.getClassSummaryReport(classId, req.user.sub);
  }

  // ======================
  //      Teachings
  // ======================

  @ApiOperation({ summary: 'Get my teaching assignments' })
  @ApiOkResponse({ description: 'Teachings returned' })
  @Get('teachings')
  getMyTeaching(@Req() req) {
    return this.teacherService.getMyTeaching(req.user.sub);
  }

  @ApiOperation({ summary: 'Get students in a teaching assignment' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Students returned' })
  @ApiNotFoundResponse({ description: 'Teaching assignment not found' })
  @Get('teachings/:id/students')
  getStudents(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.teacherService.getStudents(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Get assignments under a teaching assignment' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Assignments returned' })
  @ApiNotFoundResponse({ description: 'Teaching assignment not found' })
  @Get('teachings/:id/assignment')
  getAssignment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.teacherService.getAssignment(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Get my homeroom class' })
  @ApiOkResponse({ description: 'Homeroom class returned' })
  @Get('homeroom/class')
  getHomeroomClass(@Req() req) {
    return this.teacherService.getHomeroomClass(req.user.sub);
  }

  // ======================
  // Attendance Sessions
  // ======================

  @ApiOperation({ summary: 'Open attendance session' })
  @ApiCreatedResponse({ description: 'Session opened' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: OpenAttendanceSessionDto })
  @Post('attendance-sessions')
  openSession(@Body() dto: OpenAttendanceSessionDto, @Req() req) {
    return this.attendanceSessionService.open(dto, req.user.sub);
  }

  @ApiOperation({ summary: 'Delete attendance session' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 77,
    description: 'Attendance Session ID',
  })
  @ApiNoContentResponse({ description: 'Session deleted' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @Delete('attendance-sessions/:id')
  deleteSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.deleteSession(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Close attendance session' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 77,
    description: 'Attendance Session ID',
  })
  @ApiOkResponse({ description: 'Session closed' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @Patch('attendance-sessions/:id/close')
  closeSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.close(id, req.user.sub);
  }

  @ApiOperation({ summary: 'List attendance sessions by teaching assignment' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Sessions returned' })
  @Get('attendance-sessions/teaching/:id')
  listSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.listByTeaching(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Get attendance session detail with students' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 77,
    description: 'Attendance Session ID',
  })
  @ApiOkResponse({ description: 'Session detail returned' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @Get('attendance-sessions/:id/detail')
  getDetailWithStudent(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.attendanceSessionService.getDetailWithStudent(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Get attendances under a session (by session ID)' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 77,
    description: 'Attendance Session ID',
  })
  @ApiOkResponse({ description: 'Attendances returned' })
  @Get('attendance-sessions/:id/attendances')
  getSessionAttendances(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.listBySession(id);
  }

  @ApiOperation({
    summary: 'Get attendance session progress by teaching assignment',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Progress returned' })
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

  @ApiOperation({ summary: 'Update attendance session' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 77,
    description: 'Attendance Session ID',
  })
  @ApiOkResponse({ description: 'Session updated' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @ApiBody({ type: UpdateAttendanceSessionDto })
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

  @ApiOperation({ summary: 'Update attendance (teacher)' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 123,
    description: 'Attendance ID',
  })
  @ApiOkResponse({ description: 'Attendance updated' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Attendance not found' })
  @ApiBody({ type: UpdateAttendanceDto })
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

  @ApiOperation({ summary: 'Bulk create attendances (teacher)' })
  @ApiOkResponse({ description: 'Attendances created/updated' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: BulkAttendanceDto })
  @Post('attendances/bulk')
  bulkAttendance(@Body() dto: BulkAttendanceDto, @Req() req) {
    return this.attendanceService.bulkCreateAttendance(dto, req.user.sub);
  }
}
