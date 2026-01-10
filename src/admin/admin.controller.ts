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
  Req,
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

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly attendanceSessionService: AttendanceSessionService,
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

  // ===================== CLASSES ====================
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

  @Patch('student/move')
  moveStudent(@Body() dto: MoveStudentDto) {
    return this.adminService.moveStudent(dto);
  }

  @Patch('student/:id/remove-class')
  removeStudentFromClass(@Param('id') studentId: number) {
    return this.adminService.removeStudentFromClass(studentId);
  }

  @Post('teaching-assignments')
  AssignTeacherDto(@Body() dto: AssignTeacherDto) {
    return this.adminService.assignTeacher(dto);
  }

  @Delete('teaching-assignments/:id')
  unassignTeacher(@Param('id') id: number) {
    return this.adminService.unassignTeacher(id);
  }

  @Post('attendance-session')
  openSession(@Body() dto: OpenAttendanceSessionDto) {
    return this.attendanceSessionService.open(dto);
  }

  @Patch('attendance-session/:id/close')
  closeSession(@Param('id') id: number, @Req() req) {
    return this.attendanceSessionService.close(id, req.user.sub);
  }
}
