import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceRepository } from './attendance.repository';
import { CreateAttendanceSessionDto } from './dto/create-session.dto';
import { Role } from '@prisma/client';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly repo: AttendanceRepository) {}

  // ======================
  //       SESSION
  // =======================

  async createSession(dto: CreateAttendanceSessionDto) {
    const openAt = new Date(dto.openAt);
    const closeAt = new Date(dto.closedAt);

    if (openAt > closeAt) {
      throw new BadRequestException('Open must be before closeAt');
    }

    return this.repo.create({
      teachingAssigmentId: dto.teachingAssigmentId,
      openAt,
      closeAt,
    });
  }

  async closeSession(sessionId: number) {
    const session = await this.repo.findSessionById(sessionId);
    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }
    return this.repo.updateSession(sessionId, false);
  }

  // ======================
  //       ATTENDANCE
  // =======================

  async createAttendance(
    dto: CreateAttendanceDto,
    actor: {
      id: number;
      role: Role;
    },
  ) {
    if (actor.role === Role.STUDENT) {
      throw new BadRequestException('Cannot create attendance');
    }

    const session = await this.repo.findSessionById(dto.attendanceSessionId);

    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }

    const now = new Date();
    if (now < session.openAt || now > session.closeAt) {
      throw new BadRequestException('Session not active');
    }

    const studentClassId = session.teachingAssigment.classId;

    if (
      !studentClassId ||
      studentClassId !== session.teachingAssigment.classId
    ) {
      throw new BadRequestException('Student not in class');
    }

    const exist = await this.repo.findAttendance(
      dto.studentId,
      dto.attendanceSessionId,
    );

    if (exist) {
      throw new BadRequestException('Attendance already exist');
    }

    return this.repo.createAttendance({
      studentId: dto.studentId,
      teachingAssigmentId: session.teachingAssigmentId,
      attendanceSessionId: dto.attendanceSessionId,
      status: dto.status,
      note: dto.note,
      createById: actor.id,
    });
  }

  async updateAttendance(attendanceId: number, dto: UpdateAttendanceDto) {
    return this.repo.updateAttendance(attendanceId, dto);
  }
}
