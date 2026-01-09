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

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('my-teaching')
  findMyTeachingAssignments(@Req() req) {
    return this.teacherService.findMyTeachingAssignments(req.user.sub);
  }

  @Post('create-assignment')
  createAssignment(@Req() req, @Body() dto: CreateAssignmentByTeacherDto) {
    return this.teacherService.createAssignmet(req.user.sub, dto);
  }

  @Patch('assignment/:id')
  updateAssignment(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: UpdateAssignmentByTeacherDto,
  ) {
    return this.teacherService.updateAssignment(req.user.sub, +id, dto);
  }

  @Delete('assignment/:id')
  deleteAssignment(@Req() req, @Param('id') id: number) {
    return this.teacherService.deleteAssignment(req.user.sub, +id);
  }

  @Post('attendance')
  inputAttendance(@Req() req, @Body() dto: InputAttendanceByTeacherDto) {
    return this.teacherService.inputAttendance(req.user.sub, dto);
  }

  @Patch('attendance/:id')
  updateAttendance(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: UpdateInputAttendanceByTeacherDto,
  ) {
    return this.teacherService.updateAttendance(req.user.sub, +id, dto);
  }

  @Get('assignments/:id/submissions')
  findSubmission(@Req() req, @Param('id') id: number) {
    return this.teacherService.findSubmission(req.user.sub, +id);
  }

  @Patch('assignments/:id/grade')
  gradeSubmission(
    @Req() req,
    @Param('id') id: number,
    dto: GradeSubmissionDto,
  ) {
    return this.teacherService.gradeSubmission(req.user.sub, +id, dto);
  }

  @Get('my-students/:id')
  findStudentByTeachingAssignment(@Req() req, @Param('id') id: number) {
    return this.teacherService.findStudentByTeachingAssignment(
      req.user.sub,
      +id,
    );
  }

  @Get('student-attendance')
  findAttendance(@Req() req, @Param('id') id: number) {
    return this.teacherService.findAttendance(req.user.sub, +id);
  }

  @Get('assigment-detail/:id')
  getAssignmentDetail(@Req() req, @Param('id') id: number) {
    return this.teacherService.getAssignmentDetail(req.user.sub, +id);
  }
}
