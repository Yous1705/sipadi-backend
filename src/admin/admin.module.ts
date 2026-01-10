import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { TeachingModule } from 'src/teaching/teaching.module';
import { ClassesModule } from 'src/classes/classes.module';
import { AttendanceSessionModule } from 'src/attendance-session/attendance-session.module';

@Module({
  imports: [
    UserModule,
    AttendanceModule,
    TeachingModule,
    ClassesModule,
    AttendanceSessionModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
