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

  // @Delete('unassign-teacher/:id')
  // unassignTeacher(@Param('id') id: string) {
  //   return this.adminService.unassignTeacher(+id);
  // }

  @Delete('delete-user/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
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

  @Get('classes')
  findAllClasses() {
    return this.adminService.findAllClasses();
  }

  @Get('teachers-by-subject')
  findTeacherBySubject(@Body('subjectName') subjectName: string) {
    return this.adminService.findTeacherBySubject(subjectName);
  }
}
