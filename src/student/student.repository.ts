import { BadRequestException, Injectable } from '@nestjs/common';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findStudentClass(studentId: number) {
    return this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        classId: true,
      },
    });
  }

  countAssignmentsByClass(classId: number) {
    return this.prisma.assignment.count({
      where: {
        teachingAssigment: {
          classId,
        },
      },
    });
  }

  countActivateAttendanceSession(classId: number) {
    return this.prisma.attendanceSession.count({
      where: {
        teachingAssigment: { classId },
        isActive: true,
      },
    });
  }

  findAssignmentsByClass(classId: number, studentId: number) {
    return this.prisma.assignment.findMany({
      where: {
        teachingAssigment: {
          classId,
        },
        status: AssignmentStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        submissions: {
          where: {
            studentId,
          },
          select: {
            id: true,
            score: true,
          },
        },
        teachingAssigment: {
          include: {
            subject: { select: { name: true } },
            teacher: { select: { name: true } },
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  findAssignmentsByTeaching(teachingAssignmentId: number, studentId: number) {
    return this.prisma.assignment.findMany({
      where: {
        teachingAssigmentId: teachingAssignmentId,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        submissions: {
          where: { studentId },
          select: {
            id: true,
            score: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  findTeachingAssignmentById(id: number) {
    return this.prisma.teachingAssigment.findUnique({
      where: {
        id,
      },
    });
  }

  findAssignmentById(id: number) {
    return this.prisma.assignment.findUnique({
      where: {
        id,
      },
      include: {
        teachingAssigment: true,
      },
    });
  }

  findAssignmentDetail(assignmentId: number, studentId: number) {
    return this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        teachingAssigment: {
          class: {
            students: {
              some: { id: studentId },
            },
          },
        },
      },
      include: {
        teachingAssigment: {
          include: {
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
        },
        submissions: {
          where: { studentId },
          select: {
            id: true,
            score: true,
            feedback: true,
            submittedAt: true,
            fileUrl: true,
          },
        },
      },
    });
  }

  findStudentById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  findSubmission(studentId: number, assignmentId: number) {
    return this.prisma.submission.findFirst({
      where: {
        studentId,
        assignmentId,
      },
    });
  }

  createSubmission(data: {
    studentId: number;
    assignmentId: number;
    fileUrl: string;
  }) {
    return this.prisma.submission.create({ data });
  }

  findAttendances(studentId: number) {
    return this.prisma.attendance.findMany({
      where: {
        studentId,
      },
      include: {
        attendanceSession: {
          include: {
            teachingAssigment: {
              include: {
                subject: { select: { name: true } },
                teacher: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        attendanceSession: {
          openAt: 'desc',
        },
      },
    });
  }

  findAttendanceSession(id: number) {
    return this.prisma.attendanceSession.findUnique({
      where: {
        id,
      },
      include: {
        teachingAssigment: true,
      },
    });
  }

  findAttendance(studentId: number, attendanceSessionId: number) {
    return this.prisma.attendance.findUnique({
      where: {
        studentId_attendanceSessionId: {
          studentId,
          attendanceSessionId,
        },
      },
    });
  }

  createAttendance(data: Prisma.AttendanceCreateInput) {
    return this.prisma.attendance.create({ data });
  }

  findMyClasses(studentId: number) {
    return this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            teachingAssigment: {
              include: {
                subject: { select: { name: true } },
                teacher: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }

  async findAttendanceRecap(studentId: number) {
    const records = await this.prisma.attendance.findMany({
      where: {
        studentId,
      },
      include: {
        teachingAssigment: {
          include: {
            subject: true,
            teacher: true,
          },
        },
      },
    });

    const map = new Map<number, any>();

    for (const r of records) {
      const key = r.teachingAssigmentId;

      if (!map.has(key)) {
        map.set(key, {
          subjectName: r.teachingAssigment.subject.name,
          teacherName: r.teachingAssigment.teacher.name,
          total: 0,
          hadir: 0,
          izin: 0,
          sakit: 0,
          alpha: 0,
        });
      }

      const agg = map.get(key);
      agg.total++;

      switch (r.status) {
        case 'HADIR':
          agg.hadir++;
          break;
        case 'IZIN':
          agg.izin++;
          break;
        case 'SAKIT':
          agg.sakit++;
          break;
        case 'ALPHA':
          agg.alpha++;
          break;
      }
    }

    return Array.from(map.values());
  }

  findTeachingAssignmentsWithDetail(classId: number, studentId: number) {
    return this.prisma.teachingAssigment.findMany({
      where: {
        classId,
      },
      include: {
        subject: { select: { name: true } },
        teacher: { select: { name: true } },

        assignment: {
          where: {
            status: 'PUBLISHED',
            deletedAt: null,
          },
          include: {
            submissions: {
              where: { studentId },
              select: { score: true },
            },
          },
          orderBy: { dueDate: 'asc' },
        },

        attendanceSession: {
          where: { isActive: true },
          include: {
            attendances: {
              where: { studentId },
              select: { id: true },
            },
          },
          orderBy: { openAt: 'desc' },
        },
      },
    });
  }

  findAttendanceSessionDetail(sessionId: number) {
    return this.prisma.attendanceSession
      .findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          name: true,
          openAt: true,
          closeAt: true,
          isActive: true,
          teachingAssigment: {
            select: {
              classId: true,
              subject: {
                select: { name: true },
              },
              teacher: {
                select: { name: true },
              },
            },
          },
        },
      })
      .then((s) =>
        s
          ? {
              id: s.id,
              name: s.name,
              openAt: s.openAt,
              closeAt: s.closeAt,
              isActive: s.isActive,
              classId: s.teachingAssigment.classId,
              subjectName: s.teachingAssigment.subject.name,
              teacherName: s.teachingAssigment.teacher.name,
            }
          : null,
      );
  }
}
