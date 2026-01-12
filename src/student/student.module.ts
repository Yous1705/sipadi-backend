import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { StudentRepository } from './student.repository';
import { SubmissionModule } from 'src/submission/submission.module';
import { AttendanceModule } from 'src/attendance/attendance.module';

@Module({
  imports: [SubmissionModule, AttendanceModule],
  controllers: [StudentController],
  providers: [StudentService, StudentRepository],
})
export class StudentModule {}
