import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getGradeReport(teachingId: number) {
    return this.prisma.teachingAssigment.findUnique({
      where: { id: teachingId },
      include: {
        class: {
          include: {
            students: true,
          },
        },
        assignment: {
          include: {
            submissions: true,
          },
        },
      },
    });
  }

  getClassWithStudents(classId: number) {
    return this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          select: {
            id: true,
            name: true,
          },
        },
        homeroomTeacher: true,
      },
    });
  }

  getTeachingAssignmentsByClass(classId: number) {
    return this.prisma.teachingAssigment.findMany({
      where: { classId },
      include: {
        subject: true,
        assignment: {
          where: { deletedAt: null },
          include: {
            submissions: true,
          },
        },
      },
    });
  }

  getAttendancesByClass(classId: number) {
    return this.prisma.attendance.findMany({
      where: {
        attendanceSession: {
          teachingAssigment: {
            classId,
          },
        },
      },
      select: {
        studentId: true,
        status: true,
      },
    });
  }
}
