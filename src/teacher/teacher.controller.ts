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
import { GradeSubmissionDto } from './dto/create-grade-submission.dto';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CreateAssignmentDto } from 'src/assignment/dto/create-assignment.dto';
import { UpdateAssignmentDto } from 'src/assignment/dto/update-assignment.dto';
import { AttendanceSessionService } from 'src/attendance-session/attendance-session.service';
import { OpenAttendanceSessionDto } from 'src/attendance-session/dto/open-session.dto';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class TeacherController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly teacherService: TeacherService,
    private readonly attendanceSessionService: AttendanceSessionService,
  ) {}

  @Post('assignment')
  createAssignment(@Body() dto: CreateAssignmentDto, @Req() req) {
    return this.assignmentService.create(dto, req.user.sub);
  }

  @Patch('assignment/:id')
  updateAssignment(
    @Param('id') id: number,
    @Body() dto: UpdateAssignmentDto,
    @Req() req,
  ) {
    return this.assignmentService.update(id, dto, req.user.sub);
  }

  @Delete('assignment/:id')
  deleteAssignment(@Param('id') id: number, @Req() req) {
    return this.assignmentService.delete(id, req.user.sub);
  }

  @Get('teachings')
  getMyTeaching(@Req() req) {
    return this.teacherService.getMyTeaching(req.user.sub);
  }

  @Get('teachings/:id/students')
  getStudents(@Param('id') Id: number, @Req() req) {
    return this.teacherService.getStudents(Id, req.user.sub);
  }

  @Get('teachings/:id/assignment')
  getAssignment(@Param('id') Id: number, @Req() req) {
    return this.teacherService.getAssignment(Id, req.user.sub);
  }

  @Get('assignments/:id/submissions')
  getSubmission(@Param('id') Id: number, @Req() req) {
    return this.teacherService.getSubmission(Id, req.user.sub);
  }

  @Post('attendance-session')
  openSession(@Body() dto: OpenAttendanceSessionDto) {
    return this.attendanceSessionService.open(dto);
  }

  @Patch('attendance-session/:id/close')
  closeSession(@Param('id') id: number, @Req() req) {
    return this.attendanceSessionService.close(id, req.user.sub);
  }

  @Get('attendance-session/teaching/:id')
  listSession(@Param('id') id: number) {
    return this.attendanceSessionService.listByTeaching(id);
  }

  @Get('attendance-sessions/:id')
  sessionDetail(@Param('id') id: number) {
    return this.attendanceSessionService.detail(id);
  }
}
