import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TeachingModule } from 'src/teaching/teaching.module';
import { TeacherRepository } from './teacher.repository';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { AttendanceSessionModule } from 'src/attendance-session/attendance-session.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { SubmissionModule } from 'src/submission/submission.module';
import { ReportModule } from 'src/report/report.module';

@Module({
  imports: [
    TeachingModule,
    AssignmentModule,
    AttendanceSessionModule,
    AttendanceModule,
    SubmissionModule,
    ReportModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository],
  exports: [TeacherService],
})
export class TeacherModule {}
