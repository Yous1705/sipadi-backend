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
  Put,
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
import { OpenAttendanceSessionDto } from 'src/attendance-session/dto/open-session.dto';
import { AttendanceService } from 'src/attendance/attendance.service';
import { UpdateAttendanceDto } from 'src/attendance/dto/update-attendance.dto';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/teaching/dto/update-subject.dto';
import { ReportService } from 'src/report/report.service';
import type { Response } from 'express';

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
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ===================== USERS =====================
  @Post('students')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.adminService.createStudent(dto);
  }

  @Post('teachers')
  createTeacher(@Body() dto: CreateTeacherDto) {
    return this.adminService.createTeacher(dto);
  }

  @Patch('users/:id/reset-password')
  resetUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.adminService.resetUserPassword(id, newPassword);
  }

  @Patch('users/:id/role')
  changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role', new ParseEnumPipe(Role)) role: Role,
  ) {
    return this.adminService.changeUserRole(id, role);
  }

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

  @Get('users/:id')
  findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findUserById(id);
  }

  @Get('users/role/:role')
  findUsersByRole(@Param('role', new ParseEnumPipe(Role)) role: Role) {
    return this.adminService.findUsersByRole(role);
  }

  @Get('classes/:id/users')
  findUsersByClass(@Param('id', ParseIntPipe) classId: number) {
    return this.adminService.findUsersByClass(classId);
  }

  // ===================== CLASSES =====================
  @Get('classes')
  findAllClasses() {
    return this.adminService.findAllClasses();
  }

  @Get('classes/by-name/:name/:year')
  findClassByNameAndYear(
    @Param('name') name: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.adminService.findClassByNameAndYear(name, year);
  }

  @Get('classes/:id')
  findClassById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findClassById(id);
  }

  @Post('classes')
  createClass(@Body() dto: CreateClassDto) {
    return this.adminService.createClass(dto);
  }

  @Patch('classes/:id')
  updateClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
  ) {
    return this.adminService.updateClass(id, dto);
  }

  @Delete('classes/:id')
  deleteClass(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteClass(id);
  }

  @Post('classes/homeroom')
  assignHomeroomTeacher(@Body() dto: AssignHomeroomTeacherDto) {
    return this.adminService.assignHomeroomTeacher(dto);
  }

  @Patch('classes/student/move')
  moveStudent(@Body() dto: MoveStudentDto) {
    return this.adminService.moveStudent(dto);
  }

  @Patch('classes/student/:id/remove-class')
  removeStudentFromClass(@Param('id', ParseIntPipe) studentId: number) {
    return this.adminService.removeStudentFromClass(studentId);
  }

  // ===================== TEACHING ASSIGNMENTS =====================
  @Get('teaching-assignments')
  findAllTeachingAssignments() {
    return this.adminService.findAllTeachingAssignments();
  }

  @Post('teaching-assignments')
  assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.adminService.assignTeacher(dto);
  }

  @Delete('teaching-assignments/:id')
  unassignTeacher(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unassignTeacher(id);
  }

  // ======================= SUBJECTS =====================
  @Get('subjects')
  findAllSubjects() {
    return this.adminService.findAllSubject();
  }

  @Post('subjects')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.adminService.createSubject(dto);
  }

  @Patch('subjects/:id')
  updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.adminService.updateSubject(id, dto);
  }

  @Delete('subjects/:id')
  deleteSubject(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteSubject(id);
  }

  // ===================== ATTENDANCE SESSION ==============
  @Patch('attendance-session/:id/close')
  closeSession(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.adminService.closeAttendanceSession(id, req.user.sub);
  }

  // ===================== ATTENDANCE =====================
  @Get('attendances')
  getAttendances(@Query() query) {
    return this.adminService.getAttendances(query);
  }

  @Patch('attendances/:id')
  updateAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.adminService.updateAttendance(id, dto);
  }

  // ============== REPORTS ==============
  @Get('reports/class/:classId')
  getClassReport(@Param('classId', ParseIntPipe) classId: number) {
    return this.reportService.getClassSummaryReportAdmin(classId);
  }

  @Get('reports/teaching/:teachingId/grades')
  getGradeReport(@Param('teachingId', ParseIntPipe) teachingId: number) {
    return this.reportService.getGradeReportAdmin(teachingId);
  }

  @Get('reports/class/:classId/export')
  exportClassReport(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('format') format: 'csv' | 'xlsx',
    @Res() res: Response,
  ) {
    return this.reportService.exportClassReportAdmin(classId, format, res);
  }
}
