import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AttendanceSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { teachingAssigmentId: number; openAt: Date; closeAt: Date }) {
    return this.prisma.attendanceSession.create({
      data: {
        teachingAssigmentId: data.teachingAssigmentId,
        openAt: data.openAt,
        closeAt: data.closeAt,
        isActive: true,
      },
    });
  }

  findAll(filter?: { classId: number; teacherId: number; subjectId: number }) {
    return this.prisma.attendanceSession.findMany({
      where: {
        teachingAssigment: {
          classId: filter?.classId,
          teacherId: filter?.teacherId,
          subjectId: filter?.subjectId,
        },
      },
      include: {
        teachingAssigment: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          },
        },
      },
      orderBy: {
        openAt: 'desc',
      },
    });
  }

  findById(sessionId: number) {
    return this.prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        teachingAssigment: {
          include: {
            class: {
              include: {
                students: {
                  where: {
                    isActive: true,
                  },
                },
              },
            },
          },
        },
        attendances: true,
      },
    });
  }

  close(sessionId: number) {
    return this.prisma.attendanceSession.update({
      where: {
        id: sessionId,
      },
      data: {
        isActive: false,
      },
    });
  }

  findByTeachingAssigment(teachingAssigmentId: number) {
    return this.prisma.attendanceSession.findMany({
      where: {
        teachingAssigmentId,
      },
      orderBy: {
        openAt: 'desc',
      },
    });
  }

  findDetail(sessionId: number) {
    return this.prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        attendances: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  createAlphaAttendance(
    data: {
      studentId: number;
      attendaceSessionId: number;
      teachingAssigmentId: number;
      createdbyId: number;
    }[],
  ) {
    return this.prisma.attendance.createMany({
      data: data.map((d) => ({
        studentId: d.studentId,
        attendanceSessionId: d.attendaceSessionId,
        teachingAssigmentId: d.teachingAssigmentId,
        status: AttendanceStatus.ALPHA,
        createById: d.createdbyId,
      })),
      skipDuplicates: true,
    });
  }
}
