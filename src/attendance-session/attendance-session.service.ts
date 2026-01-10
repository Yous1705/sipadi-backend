import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAttendanceSessionDto } from './dto/open-session.dto';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { PrismaService } from 'src/prisma/prisma.service';

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

    const attendIds = session.attendances.map((a) => a.id);

    const alphaStudents = session.teachingAssigment.class.students.filter(
      (s) => !attendIds.includes(s.id),
    );

    if (alphaStudents.length > 0) {
      await this.repo.createAlphaAttendance(
        alphaStudents.map((s) => ({
          studentId: s.id,
          attendaceSessionId: session.id,
          teachingAssigmentId: session.teachingAssigmentId,
          createdbyId: closedById,
        })),
      );
    }

    return this.repo.close(sessionId);
  }

  listByTeaching(teachingAssigmentId: number) {
    return this.repo.findByTeachingAssigment(teachingAssigmentId);
  }

  detail(sessionId: number) {
    return this.repo.findDetail(sessionId);
  }
}
