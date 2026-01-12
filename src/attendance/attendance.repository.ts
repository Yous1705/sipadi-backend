import { Injectable } from '@nestjs/common';
import { AttendanceStatus, Role } from '@prisma/client';
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
            class: {
              include: {
                students: {
                  select: {
                    id: true,
                  },
                },
              },
            },
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
  findAll(filter?: {
    studentId?: number;
    classId?: number;
    teacherId?: number;
    subjectId?: number;
  }) {
    return this.prisma.attendance.findMany({
      where: {
        studentId: filter?.studentId,
        teachingAssigment: {
          classId: filter?.classId,
          teacherId: filter?.teacherId,
          subjectId: filter?.subjectId,
        },
      },
      include: {
        student: true,
        teachingAssigment: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findBySession(sessionId: number) {
    return this.prisma.attendance.findMany({
      where: {
        attendanceSessionId: sessionId,
      },
      include: {
        student: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  findById(id: number) {
    return this.prisma.attendance.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
        teachingAssigment: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          },
        },
      },
    });
  }

  bulkCreateAttendance(data) {
    return this.prisma.attendance.createMany({
      data,
      skipDuplicates: true,
    });
  }

  findStudentByClass(classId: number) {
    return this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        classId,
        isActive: true,
      },
    });
  }
}
