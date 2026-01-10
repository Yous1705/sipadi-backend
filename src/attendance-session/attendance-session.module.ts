import { Module } from '@nestjs/common';
import { AttendanceSessionService } from './attendance-session.service';
import { AttendanceSessionController } from './attendance-session.controller';
import { AttendanceSessionRepository } from './attendance-session.repository';

@Module({
  controllers: [AttendanceSessionController],
  providers: [AttendanceSessionService, AttendanceSessionRepository],
  exports: [AttendanceSessionService, AttendanceSessionRepository],
})
export class AttendanceSessionModule {}
