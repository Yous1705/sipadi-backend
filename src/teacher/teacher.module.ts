import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TeachingModule } from 'src/teaching/teaching.module';
import { TeacherRepository } from './teacher.repository';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { AttendanceSessionModule } from 'src/attendance-session/attendance-session.module';

@Module({
  imports: [TeachingModule, AssignmentModule, AttendanceSessionModule],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository],
  exports: [TeacherService],
})
export class TeacherModule {}
