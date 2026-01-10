import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AttendanceSessionService } from './attendance-session.service';

@Controller('attendance-session')
export class AttendanceSessionController {
  constructor(
    private readonly attendanceSessionService: AttendanceSessionService,
  ) {}
}
