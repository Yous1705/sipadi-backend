import { UpdateSubmissionScoreDto } from './dto/update-submission.dto';
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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { MoveStudentDto } from './dto/move-student.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignHomeroomTeacherDto } from './dto/assign-homeroom-teacher.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateTeacherDto } from './dto/updatee-teacher.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { AssignmentFilterDto } from './dto/assignment-filter.dto';
import { SubmissionFilterDto } from './dto/submission-filter.dto';
import { CreateAttendanceDto } from './dto/ccreate-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-student')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.adminService.createStudent(dto);
  }

  @Post('create-teacher')
  createTeacher(@Body() dto: CreateTeacherDto) {
    return this.adminService.createTeacher(dto);
  }

  @Post('create-class')
  createClass(@Body() dto: CreateClassDto) {
    return this.adminService.createClass(dto);
  }

  @Post('create-subject')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.adminService.createSubject(dto);
  }

  @Put('move-student')
  moveStudent(@Body() dto: MoveStudentDto) {
    return this.adminService.moveStudent(dto);
  }

  @Put('update-class/:id')
  updateClass(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.adminService.updateClass(+id, dto);
  }

  @Post('assign-homeroom-teacher')
  assignHomeroomTeacher(@Body() dto: AssignHomeroomTeacherDto) {
    return this.adminService.assignHomeroomTeacher(dto);
  }

  @Post('assign-teacher')
  assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.adminService.assignTeacher(dto);
  }

  @Patch('update-student/:id')
  updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.adminService.updateStudent(+id, dto);
  }

  @Patch('update-teacher/:id')
  updateTeacher(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.adminService.updateTeacher(+id, dto);
  }

  @Patch('reset-password/:id')
  resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.adminService.resetPassword(+id, newPassword);
  }

  @Patch('restore-user/:id')
  restoreUser(@Param('id') id: string) {
    return this.adminService.restoreUser(+id);
  }

  @Patch('change-user-role/:id')
  chnageUserRole(@Param('id') id: string, @Body('newRole') newRole: Role) {
    return this.adminService.changeUserRole(+id, newRole);
  }

  @Delete('delete-user/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  @Delete('delete-class/:id')
  deleteClass(@Param('id') id: string) {
    return this.adminService.deleteClass(+id);
  }

  @Delete('remove-student-from-class/:id')
  removeStudentFromClass(@Param('id') id: string) {
    return this.adminService.removeStudentFromClass(+id);
  }

  @Get('users')
  findAllusers() {
    return this.adminService.findAllUsers();
  }

  @Get('teachers')
  findAllTeachers() {
    return this.adminService.findAllTeachers();
  }

  @Get('students')
  findAllStudents() {
    return this.adminService.findAllStudents();
  }

  @Get('users/:email')
  findUserByeEmail(@Param('email') email: string) {
    return this.adminService.findUsersByEmail(email);
  }

  @Get('attendances')
  findAllAttendances() {
    return this.adminService.findAllAttendances();
  }

  @Get('attendances/filter')
  findAttendancesByFilter(@Body() dto: AttendanceFilterDto) {
    return this.adminService.findAttendancesByFilter(dto);
  }

  @Get('classes')
  findAllClasses() {
    return this.adminService.findAllClasses();
  }

  @Get('teachers-by-subject')
  findTeacherBySubject(@Body('subjectName') subjectName: string) {
    return this.adminService.findTeacherBySubject(subjectName);
  }

  @Delete('delete-attendance/:id')
  deleteAttendance(@Param('id') id: string) {
    return this.adminService.deleteAttendance(+id);
  }

  @Get('assignments')
  findAllAssignments() {
    return this.adminService.findAllAssignments();
  }

  @Get('assignments/filter')
  findAssignmentsByFilter(@Body() dto: AssignmentFilterDto) {
    return this.adminService.findAssignmentByFilter(dto);
  }

  @Delete('delete-assignment/:id')
  deleteAssignment(@Param('id') id: string) {
    return this.adminService.deleteAssigment(+id);
  }

  @Get('submissions')
  findAllSubmissions() {
    return this.adminService.findAllSubmissions();
  }

  @Get('submissions/filter')
  findSubmissionsByFilter(@Body() dto: SubmissionFilterDto) {
    return this.adminService.findSubmissionByFilter(dto);
  }

  @Delete('delete-submission/:id')
  deleteSubmission(@Param('id') id: string) {
    return this.adminService.deleteSubmission(+id);
  }

  @Post('create-attendance')
  createAttendance(@Body() dto: CreateAttendanceDto) {
    return this.adminService.createAttendance(dto);
  }

  @Patch('update-attendance/:id')
  updateAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.adminService.updateAttendance(+id, dto);
  }

  @Patch('update-assignment/:id')
  updateAssignment(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.adminService.updateAssignment(+id, dto);
  }

  @Patch('update-submission-score/:id')
  updateSubmissionScore(
    @Param('id') id: string,
    @Body() dto: UpdateSubmissionScoreDto,
  ) {
    return this.adminService.updateSubmissionScore(+id, dto);
  }

  @Post('create-submission')
  createSubmission(@Body() dto: CreateSubmissionDto) {
    return this.adminService.createSubmission(dto);
  }
}
