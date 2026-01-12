import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAttendanceSessionDto } from './dto/open-session.dto';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceSessionService {
  constructor(
    private readonly repo: AttendanceSessionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async open(dto: OpenAttendanceSessionDto) {
    const openAt = new Date(dto.openAt);
    const closeAt = new Date(dto.closeAt);

    if (openAt > closeAt) {
      throw new BadRequestException('Open must be before closeAt');
    }

    const teaching = await this.prisma.teachingAssigment.findUnique({
      where: {
        id: dto.teachingAssigmentId,
      },
    });
    if (!teaching) {
      throw new BadRequestException('Teaching assignment not found');
    }

    const activeSession = await this.prisma.attendanceSession.findFirst({
      where: {
        teachingAssigmentId: dto.teachingAssigmentId,
        isActive: true,
      },
    });

    if (activeSession) {
      throw new BadRequestException('Session already active');
    }

    return this.repo.create({
      teachingAssigmentId: dto.teachingAssigmentId,
      openAt,
      closeAt,
    });
  }

  async close(sessionId: number, closedById: number) {
    const session = await this.repo.findById(sessionId);
    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }

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
        where: { id: sessionId },
        data: { isActive: false },
      });
    });

    return { success: true };
  }

  listAll(filter?: { classId: number; teacherId: number; subjectId: number }) {
    return this.repo.findAll(filter);
  }

  listByTeaching(teachingAssigmentId: number) {
    return this.repo.findByTeachingAssigment(teachingAssigmentId);
  }

  detail(sessionId: number) {
    return this.repo.findDetail(sessionId);
  }

  async forceClose(sessionId: number) {
    const session = await this.repo.findById(sessionId);

    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }

    return this.repo.close(sessionId);
  }
}
