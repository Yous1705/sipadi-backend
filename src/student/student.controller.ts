import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { SubmissionService } from 'src/submission/submission.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StudentAttendanceDto } from 'src/attendance/dto/student-attendance.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Student')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized (missing/invalid JWT)' })
@ApiForbiddenResponse({ description: 'Forbidden (not a Student)' })
@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly submissionService: SubmissionService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // ======================
  // Dashboard
  // ======================

  @ApiOperation({ summary: 'Get student dashboard' })
  @ApiOkResponse({ description: 'Dashboard returned' })
  @Get('dashboard')
  getDashboard(@Req() req) {
    return this.studentService.getDashboard(req.user.sub);
  }

  // ======================
  // Subjects
  // ======================

  @ApiOperation({ summary: 'Get my subjects' })
  @ApiOkResponse({ description: 'Subjects returned' })
  @Get('subjects')
  getMySubjects(@Req() req) {
    return this.studentService.getMySubjects(req.user.sub);
  }

  @ApiOperation({ summary: 'Get subject detail (by teaching assignment ID)' })
  @ApiParam({
    name: 'teachingAssigmentId',
    type: Number,
    example: 4,
    description: 'Teaching Assignment ID',
  })
  @ApiOkResponse({ description: 'Subject returned' })
  @ApiNotFoundResponse({
    description: 'Teaching assignment / subject not found',
  })
  @Get('subjects/:teachingAssigmentId')
  getSubject(
    @Req() req,
    @Param('teachingAssigmentId', ParseIntPipe) teachingAssigmentId: number,
  ) {
    return this.studentService.getSubject(req.user.sub, teachingAssigmentId);
  }

  // ======================
  // Classes
  // ======================

  @ApiOperation({ summary: 'Get my classes' })
  @ApiOkResponse({ description: 'Classes returned' })
  @Get('classes')
  getMyClasses(@Req() req) {
    return this.studentService.getMyClasses(req.user.sub);
  }

  @ApiOperation({ summary: 'Get class detail' })
  @ApiParam({ name: 'classId', type: Number, example: 3 })
  @ApiOkResponse({ description: 'Class returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @Get('classes/:classId')
  getClass(@Req() req, @Param('classId', ParseIntPipe) classId: number) {
    return this.studentService.getClass(req.user.sub, classId);
  }

  // ======================
  // Assignments + Submissions
  // ======================

  @ApiOperation({ summary: 'Get assignment detail' })
  @ApiParam({ name: 'assignmentId', type: Number, example: 12 })
  @ApiOkResponse({ description: 'Assignment detail returned' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Get('assignments/:assignmentId')
  getAssignmentDetail(
    @Req() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    return this.studentService.getAssignmentsDetail(req.user.sub, assignmentId);
  }

  @ApiOperation({ summary: 'Submit assignment by URL' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 12,
    description: 'Assignment ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://example.com/file' },
      },
      required: ['url'],
    },
  })
  @ApiOkResponse({ description: 'Submission created/updated' })
  @ApiBadRequestResponse({
    description: 'Invalid URL / submission policy error',
  })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Post('assignments/:id/submission/url')
  submitUrl(
    @Param('id', ParseIntPipe) id: number,
    @Body('url') url: string,
    @Req() req,
  ) {
    return this.submissionService.submitUrl(id, url, req.user.sub);
  }

  @ApiOperation({ summary: 'Submit assignment by file upload' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 12,
    description: 'Assignment ID',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ description: 'File uploaded and submission updated' })
  @ApiBadRequestResponse({
    description: 'File too large / invalid file / policy error',
  })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  @Post('assignments/:id/submission/file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 },
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

  // ======================
  // Attendance
  // ======================

  @ApiOperation({ summary: 'Get attendance session detail (for student)' })
  @ApiParam({ name: 'sessionId', type: Number, example: 77 })
  @ApiOkResponse({ description: 'Session detail returned' })
  @ApiNotFoundResponse({ description: 'Session not found' })
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

  @ApiOperation({ summary: 'Get active attendance session by class' })
  @ApiParam({ name: 'classId', type: Number, example: 3 })
  @ApiOkResponse({ description: 'Active attendance returned (if any)' })
  @ApiNotFoundResponse({ description: 'Class not found' })
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

  @ApiOperation({ summary: 'Get attendance history by class' })
  @ApiParam({ name: 'classId', type: Number, example: 3 })
  @ApiOkResponse({ description: 'Attendance history returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
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

  @ApiOperation({ summary: 'Get assignment history by class' })
  @ApiParam({ name: 'classId', type: Number, example: 3 })
  @ApiOkResponse({ description: 'Assignment history returned' })
  @ApiNotFoundResponse({ description: 'Class not found' })
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

  @ApiOperation({ summary: 'Student attend (submit attendance)' })
  @ApiCreatedResponse({ description: 'Attendance recorded' })
  @ApiBadRequestResponse({ description: 'Validation error / session closed' })
  @ApiBody({ type: StudentAttendanceDto })
  @Post('attendance')
  attend(@Body() dto: StudentAttendanceDto, @Req() req) {
    return this.attendanceService.studentAttend(dto, req.user.sub);
  }
}
