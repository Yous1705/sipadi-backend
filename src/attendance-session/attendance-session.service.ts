import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpenAttendanceSessionDto } from './dto/open-session.dto';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';
import { UpdateAttendanceSessionDto } from './dto/update-attendance.dto';

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
      name: dto.name,
      openAt,
      closeAt,
    });
  }

  async close(sessionId: number, closedById: number) {
    const session = await this.repo.findById(sessionId);
    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }

    await this.repo.closeWithAlpha(sessionId, closedById);

    return { success: true };
  }

  listAll(filter?: { classId: number; teacherId: number; subjectId: number }) {
    return this.repo.findAll(filter);
  }

  async listByTeaching(teachingAssigmentId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: {
        id: teachingAssigmentId,
      },
    });

    return this.repo.findByTeachingAssigment(teachingAssigmentId);
  }

  async getDetailWithStudent(sessionId: number) {
    const session = await this.repo.getDetailWithStudent(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.isActive && session.closeAt < new Date()) {
      await this.close(session.id, session.teachingAssigment.teacherId);
    }

    const students = session.teachingAssigment.class.students.map((student) => {
      const attendance = session.attendances.find(
        (a) => a.studentId === student.id,
      );
      return {
        studentId: student.id,
        name: student.name,
        attendanceId: attendance?.id ?? null,
        status: attendance?.status ?? null,
        note: attendance?.note ?? null,
      };
    });

    return {
      id: session.id,
      name: session.name,
      openAt: session.openAt,
      closeAt: session.closeAt,
      isActive: session.isActive,
      teachingAssigmentId: session.teachingAssigmentId,
      stats: {
        totalStudents: students.length,
        attended: session.attendances.length,
      },
      students,
    };
  }

  async forceClose(sessionId: number) {
    const session = await this.repo.findById(sessionId);

    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }

    return this.repo.close(sessionId);
  }

  async updateAttendanceSession(id: number, dto: UpdateAttendanceSessionDto) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: {
        id: id,
      },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.isActive && session.closeAt < new Date()) {
      await this.close(session.id, session.teachingAssigmentId);
    }

    let isActive = session.isActive;
    if (dto.closeAt) {
      const newCloseAt = new Date(dto.closeAt);
      isActive = newCloseAt > new Date();
    }

    if (isActive && !session.isActive) {
      const activeSession = await this.prisma.attendanceSession.findFirst({
        where: {
          teachingAssigmentId: session.teachingAssigmentId,
          isActive: true,
          id: { not: id },
        },
      });
      if (activeSession) {
        throw new BadRequestException(
          'Another session is already active for this teaching assignment',
        );
      }
    }

    return this.repo.update(id, { ...dto, isActive });
  }

  async getAttendanceSession(teachingAssigmentId: number) {
    const teaching = await this.prisma.teachingAssigment.findUnique({
      where: {
        id: teachingAssigmentId,
      },
    });

    if (!teaching) {
      throw new NotFoundException('Teaching assignment not found');
    }
    const active = await this.prisma.attendanceSession.findFirst({
      where: {
        id: teachingAssigmentId,
      },
    });
    const session = await this.repo.getAttendanceSession(teachingAssigmentId);

    if (!active) {
      throw new NotFoundException('Session not found');
    }

    return session.map((session) => ({
      id: session.id,
      name: session.name,
      isActive: session.isActive,
      openAt: session.openAt,
      closeAt: session.closeAt,

      attendedCount: session._count.attendances,
      totalStudent: session.teachingAssigment.class._count.students,
      progress: `${session._count.attendances}/${session.teachingAssigment.class._count.students}`,
    }));
  }

  deleteSession(id: number) {
    return this.repo.deleteSession(id);
  }
}
