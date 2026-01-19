import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { SubmissionService } from 'src/submission/submission.service';
import { SubmitAssignmentDto } from 'src/submission/dto/submit-assignment.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { AttendSessionDto } from '../attendance/dto/attend-session.dto';
import { StudentAttendanceDto } from 'src/attendance/dto/student-attendance.dto';
import { AttendanceService } from 'src/attendance/attendance.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('student')
export class StudentController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly studentService: StudentService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // Dashboard
  @Get('dashboard')
  getDashboard(@Req() req) {
    return this.studentService.getDashboard(req.user.sub);
  }

  @Get('subjects')
  getMySubjects(@Req() req) {
    return this.studentService.getMySubjects(req.user.sub);
  }

  @Get('subjects/:teachingAssigmentId')
  getSubjectHub(
    @Param('teachingAssigmentId', ParseIntPipe) teachingAssigmentId: number,
    @Req() req,
  ) {
    return this.studentService.getSubject(teachingAssigmentId, req.user.sub);
  }

  @Get('classes')
  getMyClasses(@Req() req) {
    return this.studentService.getMyClasses(req.user.sub);
  }

  @Get('classes/:classId')
  getClass(@Req() req, @Param('classId', ParseIntPipe) classId: number) {
    return this.studentService.getClass(req.user.sub, classId);
  }

  //
  @Get('assignments/:assignmentId')
  getAssignmentDetail(
    @Req() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    return this.studentService.getAssignmentsDetail(req.user.sub, assignmentId);
  }

  @Post('assignments/:id/submission/url')
  submitUrl(
    @Param('id', ParseIntPipe) id: number,
    @Body('url') url: string,
    @Req() req,
  ) {
    return this.submissionService.submitUrl(id, url, req.user.sub);
  }

  @Post('assignments/:id/submission/file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      storage: diskStorage({
        destination: './uploads/submissions',
        filename: (_, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${unique}-${file.originalname}`);
        },
      }),
    }),
  )
  submitFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.submissionService.submitFile(id, file, req.user.sub);
  }

  // ===== Attendance =====
  @Get('attendance/session/:sessionId')
  getAttendanceSessionDetail(
    @Req() req,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.studentService.getAttendanceSessionDetail(
      req.user.sub,
      sessionId,
    );
  }

  @Get('classes/:classId/attendance/active')
  getActiveAttendance(
    @Req() req,
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    return this.studentService.getActiveAttendanceByClass(
      req.user.sub,
      classId,
    );
  }

  @Get('classes/:classId/attendance/history')
  getAttendanceHistory(
    @Req() req,
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    return this.studentService.getAttendanceHistoryByClass(
      req.user.sub,
      classId,
    );
  }

  @Get('classes/:classId/assignments/history')
  getAssignmentHistory(
    @Req() req,
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    return this.studentService.getAssignmentHistoryByClass(
      req.user.sub,
      classId,
    );
  }

  @Post('attendance')
  attend(@Body() dto: StudentAttendanceDto, @Req() req) {
    return this.attendanceService.studentAttend(dto, req.user.sub);
  }
}
