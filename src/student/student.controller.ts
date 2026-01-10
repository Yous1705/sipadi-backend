import { AssignmentService } from './../assignment/assignment.service';
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
import { StudentService } from './student.service';
import { SubmissionService } from 'src/submission/submission.service';
import { SubmitAssignmentDto } from 'src/submission/dto/submit-assignment.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { AttendSessionDto } from './dto/attend-session.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('student')
export class StudentController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly studentService: StudentService,
  ) {}

  @Post('submission')
  submitAssignment(@Body() dto: SubmitAssignmentDto, @Req() req) {
    return this.submissionService.submit(dto, req.user.sub);
  }

  @Get('dashboard')
  getDashboard(@Req() req) {
    return this.studentService.getDashboard(req.user.sub);
  }

  @Get('assignments')
  getAssignments(@Req() req) {
    return this.studentService.getAssignments(req.user.sub);
  }

  @Post('assignments/:id/submit')
  submitAssignments(@Param('id') id: number, @Body() dto: SubmitAssignmentDto) {
    return this.studentService.submitAssignments(id, dto);
  }

  @Get('attendances')
  getAttendances(@Req() req) {
    return this.studentService.getMyAttendances(req.user.sub);
  }

  @Post('attend')
  attendSessions(@Req() req, @Body() dto: AttendSessionDto) {
    return this.studentService.attendSession(req.user.sub, dto);
  }
}
