import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TeacherModule } from './teacher/teacher.module';
import { AttendanceModule } from './attendance/attendance.module';
import { UserModule } from './user/user.module';
import { ClassesModule } from './classes/classes.module';
import { TeachingModule } from './teaching/teaching.module';
import { AssignmentModule } from './assignment/assignment.module';
import { SubmissionModule } from './submission/submission.module';
import { StudentModule } from './student/student.module';
import { AttendanceSessionModule } from './attendance-session/attendance-session.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, TeacherModule, AttendanceModule, UserModule, ClassesModule, TeachingModule, AssignmentModule, SubmissionModule, StudentModule, AttendanceSessionModule, ReportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
