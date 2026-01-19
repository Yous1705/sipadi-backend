import { BadRequestException, Injectable } from '@nestjs/common';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  getStudentClassId(studentId: number) {
    return this.prisma.user.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });
  }

  countPublishedAssignmentsByClass(classId: number) {
    return this.prisma.assignment.count({
      where: {
        teachingAssigment: { classId },
        status: AssignmentStatus.PUBLISHED,
        deletedAt: null,
      },
    });
  }

  countActiveAttendanceSessionsByClass(classId: number) {
    return this.prisma.attendanceSession.count({
      where: {
        teachingAssigment: { classId },
        isActive: true,
      },
    });
  }

  findMyClasses(studentId: number) {
    return this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        class: {
          select: {
            id: true,
            name: true,
            year: true,
            teachingAssigment: {
              select: {
                id: true,
                subject: { select: { name: true } },
                teacher: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }

  findClassDetail(classId: number, studentId: number) {
    return this.prisma.teachingAssigment.findMany({
      where: { classId },
      select: {
        id: true,
        subject: { select: { name: true } },
        teacher: { select: { name: true } },

        assignment: {
          where: { status: AssignmentStatus.PUBLISHED, deletedAt: null },
          select: {
            id: true,
            title: true,
            dueDate: true,
            submissions: {
              where: { studentId },
              select: { score: true },
            },
          },
          orderBy: { dueDate: 'asc' },
        },

        attendanceSession: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            openAt: true,
            closeAt: true,
            isActive: true,
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

  findAssignmentDetail(assignmentId: number, studentId: number) {
    return this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        teachingAssigment: {
          class: { students: { some: { id: studentId } } },
        },
        deletedAt: null,
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

            kind: true,
            url: true,
          },
        },
      },
    });
  }

  findActiveAttendanceSessionsByClass(classId: number, studentId: number) {
    return this.prisma.attendanceSession.findMany({
      where: {
        teachingAssigment: { classId },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        openAt: true,
        closeAt: true,
        isActive: true,
        teachingAssigmentId: true,
        teachingAssigment: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true } },
          },
        },
        attendances: {
          where: { studentId },
          select: { id: true, status: true },
        },
      },
      orderBy: { openAt: 'desc' },
    });
  }

  findAttendanceHistoryByClass(classId: number, studentId: number, take = 30) {
    return this.prisma.attendanceSession.findMany({
      where: {
        teachingAssigment: { classId },
      },
      select: {
        id: true,
        name: true,
        openAt: true,
        closeAt: true,
        isActive: true,
        teachingAssigment: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true } },
          },
        },
        attendances: {
          where: { studentId },
          select: { id: true, status: true, note: true, createdAt: true },
        },
      },
      orderBy: { openAt: 'desc' },
      take,
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
              subject: { select: { name: true } },
              teacher: { select: { name: true } },
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

  findSubjectDetail(
    classId: number,
    teachingAssigmentId: number,
    studentId: number,
  ) {
    return this.prisma.teachingAssigment.findFirst({
      where: { id: teachingAssigmentId, classId },
      select: {
        id: true,
        subject: { select: { name: true } },
        teacher: { select: { name: true } },

        assignment: {
          where: { status: AssignmentStatus.PUBLISHED, deletedAt: null },
          select: {
            id: true,
            title: true,
            dueDate: true,
            submissions: {
              where: { studentId },
              select: { score: true },
            },
          },
          orderBy: { dueDate: 'asc' },
        },

        attendanceSession: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            openAt: true,
            closeAt: true,
            isActive: true,
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

  findPendingAssignmentsByStudent(studentId: number, take = 6) {
    return this.prisma.assignment.findMany({
      where: {
        status: AssignmentStatus.PUBLISHED,
        deletedAt: null,
        dueDate: { gte: new Date() },
        teachingAssigment: {
          class: { students: { some: { id: studentId } } },
        },
        submissions: {
          none: { studentId },
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        teachingAssigmentId: true,
        teachingAssigment: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take,
    });
  }

  findPendingAttendanceSessionsByStudent(studentId: number, take = 6) {
    return this.prisma.attendanceSession.findMany({
      where: {
        isActive: true,
        teachingAssigment: {
          class: { students: { some: { id: studentId } } },
        },
        attendances: {
          none: { studentId }, // belum absen
        },
      },
      select: {
        id: true,
        name: true,
        openAt: true,
        closeAt: true,
        teachingAssigmentId: true,
        teachingAssigment: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true } },
          },
        },
      },
      orderBy: { openAt: 'desc' },
      take,
    });
  }

  // student.repository.ts (contoh)
  findAssignmentHistoryByClass(classId: number, studentId: number, take = 100) {
    return this.prisma.assignment.findMany({
      where: {
        deletedAt: null,
        teachingAssigment: { classId },
      },
      include: {
        teachingAssigment: {
          include: {
            subject: true,
            teacher: true,
          },
        },
        submissions: {
          where: { studentId },
          take: 1,
        },
      },
      orderBy: { dueDate: 'desc' },
      take,
    });
  }
}
