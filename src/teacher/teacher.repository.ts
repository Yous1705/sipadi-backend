import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendanceStatus, Role } from '@prisma/client';
@Injectable()
export class TeacherRepository {
  constructor(private readonly prisma: PrismaService) {}

  getMyTeachings(teacherId: number) {
    return this.prisma.teachingAssigment.findMany({
      where: {
        teacherId,
      },
      include: {
        class: true,
        subject: true,
      },
    });
  }

  getStudents(classId: number) {
    return this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        classId: classId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        class: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  getAssignment(teachingAssigmentId: number) {
    return this.prisma.assignment.findMany({
      where: {
        teachingAssigmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSubmission(assignmentId: number, teacherId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        teachingAssigment: true,
      },
    });

    if (!assignment || assignment.teachingAssigment.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized teaching assignment');
    }

    return this.prisma.submission.findMany({
      where: {
        assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
