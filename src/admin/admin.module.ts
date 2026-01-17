import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { TeachingModule } from 'src/teaching/teaching.module';
import { ClassesModule } from 'src/classes/classes.module';
import { AttendanceSessionModule } from 'src/attendance-session/attendance-session.module';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { AdminRepository } from './admin.repository';

@Module({
  imports: [
    UserModule,
    AttendanceModule,
    TeachingModule,
    ClassesModule,
    AttendanceSessionModule,
    AssignmentModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
