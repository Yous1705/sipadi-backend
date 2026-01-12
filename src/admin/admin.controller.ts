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
  ) {}

  // ===================== USER ====================

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
    @Param('id') id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.adminService.resetUserPassword(id, newPassword);
  }

  @Get('users/:id')
  findById(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  @Get('users')
  findAll() {
    return this.userService.findAll();
  }

  @Get('users/role/:role')
  findAllByRole(@Param('role', new ParseEnumPipe(Role)) role: Role) {
    return this.userService.findAllByRole(role);
  }

  @Get('class/:id')
  findByClass(@Param('id') classId: number) {
    return this.userService.findByClass(classId);
  }

  // ===================== CLASSES ====================

  @Get('classes')
  findAllClasses() {
    return this.classesService.findAll();
  }

  @Get('classes/:id')
  findClassById(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findById(id);
  }

  @Get('classes/:name/:year')
  findClassByNameAndYear(
    @Param('name') name: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.classesService.findByNameAndYear(name, year);
  }

  @Post('classes')
  createClass(@Body() dto: CreateClassDto) {
    return this.adminService.createCLass(dto);
  }

  @Patch('classes/:id')
  updateClass(@Param('id') id: number, @Body() dto: UpdateClassDto) {
    return this.adminService.updateClass(id, dto);
  }

  @Delete('classes/:id')
  deleteClass(@Param('id') id: number) {
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
  removeStudentFromClass(@Param('id') studentId: number) {
    return this.adminService.removeStudentFromClass(studentId);
  }

  // ===================== TEACHING ====================

  @Post('teaching-assignments')
  assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.adminService.assignTeacher(dto);
  }

  @Delete('teaching-assignments/:id')
  unassignTeacher(@Param('id') id: number) {
    return this.adminService.unassignTeacher(id);
  }

  @Get('teaching-assignments')
  findAllTeachingAssignments() {
    return this.teachingService.findAll();
  }

  @Post('subjects')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.teachingService.createSubject(dto);
  }

  @Patch('subjects/:id')
  updateSubject(@Param('id') id: number, @Body() dto: UpdateSubjectDto) {
    return this.teachingService.updateSubject(id, dto);
  }

  @Get('subjects')
  findAllSubject() {
    return this.teachingService.findAllSubject();
  }

  // ===================== ATTENDANCE SESSION ====================

  @Post('attendance-session')
  openSession(@Body() dto: OpenAttendanceSessionDto) {
    return this.attendanceSessionService.open(dto);
  }

  @Patch('attendance-session/:id/close')
  closeSession(@Param('id') id: number, @Req() req) {
    return this.attendanceSessionService.close(id, req.user.sub);
  }

  @Get('attendance-session')
  getAllSession(@Query() query) {
    return this.attendanceSessionService.listAll(query);
  }

  @Get('attendance-session/:id')
  getSession(@Param('id') id: number) {
    return this.attendanceSessionService.detail(id);
  }

  @Patch('attendance-session/:id/force-close')
  forceClose(@Param('id') id: number) {
    return this.attendanceSessionService.forceClose(id);
  }

  // ===================== ATTENDANCE ====================
  @Get('attendances')
  getAttendances(@Query() query) {
    return this.attendanceService.getAllAttendances(query);
  }

  @Patch('attendances/:id')
  updateAttendance(@Param('id') id: number, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(id, dto);
  }
}
