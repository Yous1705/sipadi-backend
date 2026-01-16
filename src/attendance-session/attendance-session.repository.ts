import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AttendanceSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    teachingAssigmentId: number;
    name: string;
    openAt: Date;
    closeAt: Date;
  }) {
    return this.prisma.attendanceSession.create({
      data: {
        teachingAssigmentId: data.teachingAssigmentId,
        name: data.name,
        openAt: data.openAt,
        closeAt: data.closeAt,
        isActive: true,
      },
    });
  }

  async closeWithAlpha(sessionId: number, closedById: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        attendances: true,
        teachingAssigment: {
          include: {
            class: {
              include: { students: true },
            },
            teacher: true,
          },
        },
      },
    });

    if (!session || !session.isActive) return;

    const attendedStudentIds = session.attendances.map((a) => a.studentId);
    const alphaStudents = session.teachingAssigment.class.students.filter(
      (s) => !attendedStudentIds.includes(s.id),
    );

    await this.prisma.$transaction(async (tx) => {
      if (alphaStudents.length > 0) {
        await tx.attendance.createMany({
          data: alphaStudents.map((s) => ({
            studentId: s.id,
            attendanceSessionId: session.id,
            teachingAssigmentId: session.teachingAssigmentId,
            status: AttendanceStatus.ALPHA,
            createById: closedById,
          })),
          skipDuplicates: true,
        });
      }

      await tx.attendanceSession.update({
        where: { id: session.id },
        data: { isActive: false },
      });
    });
  }

  async closeOverdueForTeaching(teachingAssigmentId: number) {
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        teachingAssigmentId,
        isActive: true,
        closeAt: { lt: new Date() },
      },
      include: { teachingAssigment: { select: { teacherId: true } } },
    });

    for (const s of sessions) {
      await this.closeWithAlpha(s.id, s.teachingAssigment.teacherId);
    }
  }

  async ensureClosedIfOverdueById(sessionId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { teachingAssigment: { select: { teacherId: true } } },
    });

    if (
      session &&
      session.isActive &&
      session.closeAt &&
      session.closeAt.getTime() < Date.now()
    ) {
      await this.closeWithAlpha(sessionId, session.teachingAssigment.teacherId);
    }
  }

  update(
    id: number,
    data: { name?: string; openAt?: Date; closeAt?: Date; isActive?: boolean },
  ) {
    return this.prisma.attendanceSession.update({
      where: {
        id,
      },
      data,
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

  async findById(sessionId: number) {
    await this.ensureClosedIfOverdueById(sessionId);

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

  async findByTeachingAssigment(teachingAssigmentId: number) {
    await this.closeOverdueForTeaching(teachingAssigmentId);

    return this.prisma.attendanceSession.findMany({
      where: {
        teachingAssigmentId,
      },
      orderBy: {
        openAt: 'desc',
      },
    });
  }

  getDetailWithStudent(sessionId: number) {
    return this.prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        attendances: {
          include: {
            student: true,
          },
        },
        teachingAssigment: {
          include: {
            class: {
              include: {
                students: true,
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

  async getAttendanceSession(teachingAssigmentId: number) {
    await this.closeOverdueForTeaching(teachingAssigmentId);

    return this.prisma.attendanceSession.findMany({
      where: {
        teachingAssigmentId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        openAt: true,
        closeAt: true,

        _count: {
          select: {
            attendances: true,
          },
        },

        teachingAssigment: {
          select: {
            class: {
              select: {
                _count: {
                  select: {
                    students: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        openAt: 'desc',
      },
    });
  }

  deleteSession(id: number) {
    return this.prisma.attendanceSession.delete({
      where: { id },
    });
  }
}
