import { TeachingService } from 'src/teaching/teaching.service';
import { ClassesService } from 'src/classes/classes.service';
import { UserService } from 'src/user/user.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseEnumPipe,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { CreateStudentDto } from '../user/dto/create-student.dto';
import { CreateTeacherDto } from '../user/dto/create-teacher.dto';
import { CreateClassDto } from '../classes/dto/create-class.dto';
import { MoveStudentDto } from '../classes/dto/move-student.dto';
import { UpdateClassDto } from '../classes/dto/update-class.dto';
import { AssignHomeroomTeacherDto } from './dto/assign-homeroom-teacher.dto';
import { AssignTeacherDto } from '../teaching/dto/assign-teacher.dto';
import { AttendanceSessionService } from 'src/attendance-session/attendance-session.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { UpdateAttendanceDto } from 'src/attendance/dto/update-attendance.dto';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/teaching/dto/update-subject.dto';
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

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized (missing/invalid JWT)' })
@ApiForbiddenResponse({ description: 'Forbidden (not an Admin)' })
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly attendanceSessionService: AttendanceSessionService,
    private readonly attendanceService: AttendanceService,
    private readonly assignmentsService: AssignmentService,
    private readonly userService: UserService,
    private readonly classesService: ClassesService,
    private readonly teachingService: TeachingService,
    private readonly reportService: ReportService,
  ) {}

  // ===================== DASHBOARD =====================
  @ApiOperation({ summary: 'Get admin dashboard (counts/summary)' })
  @ApiOkResponse({ description: 'Dashboard summary returned' })
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ===================== USERS =====================
  @ApiOperation({ summary: 'Create student user' })
  @ApiCreatedResponse({ description: 'Student created' })
  @ApiBadRequestResponse({ description: 'Validation error / bad request' })
  @ApiBody({ type: CreateStudentDto })
  @Post('students')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.adminService.createStudent(dto);
  }

  @ApiOperation({ summary: 'Create teacher user' })
  @ApiCreatedResponse({ description: 'Teacher created' })
  @ApiBadRequestResponse({ description: 'Validation error / bad request' })
  @ApiBody({ type: CreateTeacherDto })
  @Post('teachers')
  createTeacher(@Body() dto: CreateTeacherDto) {
    return this.adminService.createTeacher(dto);
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { newPassword: { type: 'string', example: 'P@ssw0rdBaru!' } },
      required: ['newPassword'],
    },
  })
  @ApiOkResponse({ description: 'Password reset success' })
  @ApiBadRequestResponse({ description: 'newPassword missing/invalid' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch('users/:id/reset-password')
  resetUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.adminService.resetUserPassword(id, newPassword);
  }

  @ApiOperation({ summary: 'Change user role' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: Object.values(Role),
          example: Role.TEACHER,
        },
      },
      required: ['role'],
    },
  })
  @ApiOkResponse({ description: 'Role updated' })
  @ApiBadRequestResponse({ description: 'Invalid role' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch('users/:id/role')
  changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role', new ParseEnumPipe(Role)) role: Role,
  ) {
    return this.adminService.changeUserRole(id, role);
  }

  @ApiOperation({ summary: 'List users (optional filters)' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    example: Role.STUDENT,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Use "true" or "false"',
    example: 'true',
  })
  @ApiOkResponse({ description: 'User list returned' })
  @Get('users')
  findAllUsers(
    @Query('role') role?: Role,
    @Query('isActive') isActive?: string,
  ) {
    return this.adminService.listUsers({
      role: role ? (role as Role) : undefined,
      isActive:
        isActive === undefined ? undefined : isActive === 'true' ? true : false,
    });
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiOkResponse({ description: 'User returned' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get('users/:id')
  findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findUserById(id);
  }

  @ApiOperation({ summary: 'List users by role' })
  @ApiParam({ name: 'role', enum: Role, example: Role.STUDENT })
  @ApiOkResponse({ description: 'Users returned' })
  @ApiBadRequestResponse({ description: 'Invalid role' })
  @Get('users/role/:role')
  findUsersByRole(@Param('role', new ParseEnumPipe(Role)) role: Role) {
    return this.adminService.findUsersByRole(role);
  }

  @ApiOperation({ summary: 'List users in a class' })
  @ApiParam({ name: 'id', type: Number, example: 3, description: 'Class ID' })
  @ApiOkResponse({ description: 'Users returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @Get('classes/:id/users')
  findUsersByClass(@Param('id', ParseIntPipe) classId: number) {
    return this.adminService.findUsersByClass(classId);
  }

  // ================ CLASSES =====================
  @ApiOperation({ summary: 'List all classes' })
  @ApiOkResponse({ description: 'Classes returned' })
  @Get('classes')
  findAllClasses() {
    return this.adminService.findAllClasses();
  }

  @ApiOperation({ summary: 'Find class by name and year' })
  @ApiParam({ name: 'name', example: 'X-A' })
  @ApiParam({ name: 'year', type: Number, example: 2026 })
  @ApiOkResponse({ description: 'Class returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @Get('classes/by-name/:name/:year')
  findClassByNameAndYear(
    @Param('name') name: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.adminService.findClassByNameAndYear(name, year);
  }

  @ApiOperation({ summary: 'Get class by ID' })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @ApiOkResponse({ description: 'Class returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @Get('classes/:id')
  findClassById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findClassById(id);
  }

  @ApiOperation({ summary: 'Create class' })
  @ApiCreatedResponse({ description: 'Class created' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: CreateClassDto })
  @Post('classes')
  createClass(@Body() dto: CreateClassDto) {
    return this.adminService.createClass(dto);
  }

  @ApiOperation({ summary: 'Update class' })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @ApiOkResponse({ description: 'Class updated' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @ApiBody({ type: UpdateClassDto })
  @Patch('classes/:id')
  updateClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
  ) {
    return this.adminService.updateClass(id, dto);
  }

  @ApiOperation({ summary: 'Delete class' })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @ApiNoContentResponse({ description: 'Class deleted (or soft-deleted)' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @Delete('classes/:id')
  deleteClass(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteClass(id);
  }

  @ApiOperation({ summary: 'Assign homeroom teacher to a class' })
  @ApiOkResponse({ description: 'Homeroom teacher assigned' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: AssignHomeroomTeacherDto })
  @Post('classes/homeroom')
  assignHomeroomTeacher(@Body() dto: AssignHomeroomTeacherDto) {
    return this.adminService.assignHomeroomTeacher(dto);
  }

  @ApiOperation({ summary: 'Move student to another class' })
  @ApiOkResponse({ description: 'Student moved' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: MoveStudentDto })
  @Patch('classes/student/move')
  moveStudent(@Body() dto: MoveStudentDto) {
    return this.adminService.moveStudent(dto);
  }

  @ApiOperation({ summary: 'Remove student from class' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 99,
    description: 'Student ID',
  })
  @ApiOkResponse({ description: 'Student removed from class' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @Patch('classes/student/:id/remove-class')
  removeStudentFromClass(@Param('id', ParseIntPipe) studentId: number) {
    return this.adminService.removeStudentFromClass(studentId);
  }

  // ===================== TEACHING ASSIGNMENTS =====================
  @ApiOperation({ summary: 'List all teaching assignments' })
  @ApiOkResponse({ description: 'Teaching assignments returned' })
  @Get('teaching-assignments')
  findAllTeachingAssignments() {
    return this.adminService.findAllTeachingAssignments();
  }

  @ApiOperation({
    summary: 'Assign teacher to class + subject (create teaching assignment)',
  })
  @ApiCreatedResponse({ description: 'Teacher assigned' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: AssignTeacherDto })
  @Post('teaching-assignments')
  assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.adminService.assignTeacher(dto);
  }

  @ApiOperation({ summary: 'Unassign teacher (delete teaching assignment)' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiNoContentResponse({ description: 'Teacher unassigned' })
  @ApiNotFoundResponse({ description: 'Teaching assignment not found' })
  @Delete('teaching-assignments/:id')
  unassignTeacher(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unassignTeacher(id);
  }

  // ======================= SUBJECTS =====================
  @ApiOperation({ summary: 'List all subjects' })
  @ApiOkResponse({ description: 'Subjects returned' })
  @Get('subjects')
  findAllSubjects() {
    return this.adminService.findAllSubject();
  }

  @ApiOperation({ summary: 'Create subject' })
  @ApiCreatedResponse({ description: 'Subject created' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiBody({ type: CreateSubjectDto })
  @Post('subjects')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.adminService.createSubject(dto);
  }

  @ApiOperation({ summary: 'Update subject' })
  @ApiParam({ name: 'id', type: Number, example: 5, description: 'Subject ID' })
  @ApiOkResponse({ description: 'Subject updated' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  @ApiBody({ type: UpdateSubjectDto })
  @Patch('subjects/:id')
  updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.adminService.updateSubject(id, dto);
  }

  @ApiOperation({ summary: 'Delete subject' })
  @ApiParam({ name: 'id', type: Number, example: 5, description: 'Subject ID' })
  @ApiNoContentResponse({ description: 'Subject deleted' })
  @ApiNotFoundResponse({ description: 'Subject not found' })
  @Delete('subjects/:id')
  deleteSubject(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteSubject(id);
  }

  // ===================== ATTENDANCE SESSION ==============
  @ApiOperation({ summary: 'Close attendance session' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 77,
    description: 'Attendance Session ID',
  })
  @ApiOkResponse({ description: 'Session closed' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @Patch('attendance-session/:id/close')
  closeSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.adminService.closeAttendanceSession(id, req.user.sub);
  }

  // ===================== ATTENDANCE =====================
  @ApiOperation({ summary: 'Get attendances (supports query filters)' })
  @ApiOkResponse({ description: 'Attendances returned' })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: Number,
    description: 'Filter by class ID (if supported by service)',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    type: Number,
    description: 'Filter by teacher ID (if supported by service)',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    type: Number,
    description: 'Filter by subject ID (if supported by service)',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    type: Number,
    description: 'Filter by student ID (if supported by service)',
  })
  @Get('attendances')
  getAttendances(@Query() query) {
    return this.adminService.getAttendances(query);
  }

  @ApiOperation({ summary: 'Update attendance' })
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
  ) {
    return this.adminService.updateAttendance(id, dto);
  }

  // ============== REPORTS ==============
  @ApiOperation({ summary: 'Get class summary report (admin)' })
  @ApiParam({ name: 'classId', type: Number, example: 3 })
  @ApiOkResponse({ description: 'Report returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @Get('reports/class/:classId')
  getClassReport(@Param('classId', ParseIntPipe) classId: number) {
    return this.reportService.getClassSummaryReportAdmin(classId);
  }

  @ApiOperation({ summary: 'Get grade report by teaching assignment (admin)' })
  @ApiParam({
    name: 'teachingId',
    type: Number,
    example: 10,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Grade report returned' })
  @ApiNotFoundResponse({ description: 'Teaching assignment not found' })
  @Get('reports/teaching/:teachingId/grades')
  getGradeReport(@Param('teachingId', ParseIntPipe) teachingId: number) {
    return this.reportService.getGradeReportAdmin(teachingId);
  }

  @ApiOperation({ summary: 'Export class report file (CSV/XLSX)' })
  @ApiParam({ name: 'classId', type: Number, example: 3 })
  @ApiQuery({
    name: 'format',
    required: true,
    enum: ['csv', 'xlsx'],
    example: 'xlsx',
    description: 'Export format',
  })
  @ApiProduces(
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({ description: 'File streamed as response' })
  @ApiBadRequestResponse({ description: 'Invalid format' })
  @Get('reports/class/:classId/export')
  exportClassReport(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('format') format: 'csv' | 'xlsx',
    @Res() res: Response,
  ) {
    return this.reportService.exportClassReportAdmin(classId, format, res);
  }
}
