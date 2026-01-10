import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
}
