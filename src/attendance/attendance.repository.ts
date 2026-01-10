import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { teachingAssigmentId: number; openAt: Date; closeAt: Date }) {
    return this.prisma.attendanceSession.create({ data });
  }

  findSessionById(id: number) {
    return this.prisma.attendanceSession.findUnique({
      where: {
        id,
      },
      include: {
        teachingAssigment: {
          include: {
            class: true,
          },
        },
      },
    });
  }

  updateSession(id: number, isActive: boolean) {
    return this.prisma.attendanceSession.update({
      where: {
        id,
      },
      data: { isActive },
    });
  }

  //   ============================
  //       ATTENDANCE
  //   ============================
  findAttendance(studentId: number, sessionId: number) {
    return this.prisma.attendance.findUnique({
      where: {
        studentId_attendanceSessionId: {
          studentId,
          attendanceSessionId: sessionId,
        },
      },
    });
  }

  createAttendance(data: {
    studentId: number;
    teachingAssigmentId: number;
    attendanceSessionId: number;
    status: AttendanceStatus;
    note?: string;
    createById: number;
  }) {
    return this.prisma.attendance.create({ data });
  }

  updateAttendance(
    id: number,
    data: {
      status?: AttendanceStatus;
      note?: string;
    },
  ) {
    return this.prisma.attendance.update({
      where: {
        id,
      },
      data,
    });
  }
}
