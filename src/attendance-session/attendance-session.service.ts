import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpenAttendanceSessionDto } from './dto/open-session.dto';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAttendanceSessionDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceSessionService {
  constructor(
    private readonly repo: AttendanceSessionRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ------------------------------
  // Helpers
  // ------------------------------
  private async assertTeachingOwnedByTeacher(
    teachingAssigmentId: number,
    teacherId: number,
  ) {
    const teaching = await this.prisma.teachingAssigment.findUnique({
      where: { id: teachingAssigmentId },
      select: { id: true, teacherId: true },
    });

    if (!teaching) {
      throw new NotFoundException('Teaching assignment not found');
    }

    if (teaching.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized teaching assignment');
    }

    return teaching;
  }

  private async assertSessionOwnedByTeacher(
    sessionId: number,
    teacherId: number,
  ) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        teachingAssigment: { select: { id: true, teacherId: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.teachingAssigment.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized session');
    }

    return session;
  }

  private computeIsActive(openAt: Date, closeAt: Date) {
    const now = new Date();
    return openAt <= now && closeAt > now;
  }

  // ------------------------------
  // Commands
  // ------------------------------
  async open(dto: OpenAttendanceSessionDto, teacherId: number) {
    const openAt = new Date(dto.openAt);
    const closeAt = new Date(dto.closeAt);

    if (Number.isNaN(openAt.getTime()) || Number.isNaN(closeAt.getTime())) {
      throw new BadRequestException('Invalid openAt/closeAt');
    }

    if (openAt >= closeAt) {
      throw new BadRequestException('openAt must be before closeAt');
    }

    await this.assertTeachingOwnedByTeacher(dto.teachingAssigmentId, teacherId);

    const isActive = this.computeIsActive(openAt, closeAt);

    if (isActive) {
      const activeSession = await this.prisma.attendanceSession.findFirst({
        where: {
          teachingAssigmentId: dto.teachingAssigmentId,
          isActive: true,
        },
        select: { id: true },
      });

      if (activeSession) {
        throw new BadRequestException('Session already active');
      }
    }
    const created = await this.repo.create({
      teachingAssigmentId: dto.teachingAssigmentId,
      name: dto.name,
      openAt,
      closeAt,
    });

    if (created.isActive !== isActive) {
      await this.repo.update(created.id, { isActive });
      return this.repo.findById(created.id);
    }

    return created;
  }

  async close(sessionId: number, teacherId: number) {
    const session = await this.assertSessionOwnedByTeacher(
      sessionId,
      teacherId,
    );

    if (!session.isActive) {
      throw new BadRequestException('Session not found or already closed');
    }

    await this.repo.closeWithAlpha(sessionId, teacherId);

    return { success: true };
  }

  async deleteSession(sessionId: number, teacherId: number) {
    await this.assertSessionOwnedByTeacher(sessionId, teacherId);
    return this.repo.deleteSession(sessionId);
  }

  // ------------------------------
  // Queries
  // ------------------------------
  async listByTeaching(teachingAssigmentId: number, teacherId: number) {
    await this.assertTeachingOwnedByTeacher(teachingAssigmentId, teacherId);
    return this.repo.findByTeachingAssigment(teachingAssigmentId);
  }

  async getDetailWithStudent(sessionId: number, teacherId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        attendances: true,
        teachingAssigment: {
          select: {
            id: true,
            teacherId: true,
            class: {
              select: {
                id: true,
                students: {
                  where: { isActive: true },
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.teachingAssigment.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized session');
    }

    // Auto close kalau sudah lewat closeAt
    if (session.isActive && session.closeAt < new Date()) {
      await this.repo.closeWithAlpha(session.id, teacherId);
      session.isActive = false;
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

  async updateAttendanceSession(
    sessionId: number,
    dto: UpdateAttendanceSessionDto,
    teacherId: number,
  ) {
    const current = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { teachingAssigment: { select: { teacherId: true } } },
    });

    if (!current) {
      throw new NotFoundException('Session not found');
    }

    if (current.teachingAssigment.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized session');
    }

    // Auto close kalau sudah overdue
    if (current.isActive && current.closeAt < new Date()) {
      await this.repo.closeWithAlpha(current.id, teacherId);
      current.isActive = false;
    }

    const nextOpenAt = dto.openAt ? new Date(dto.openAt) : current.openAt;
    const nextCloseAt = dto.closeAt ? new Date(dto.closeAt) : current.closeAt;

    if (
      Number.isNaN(nextOpenAt.getTime()) ||
      Number.isNaN(nextCloseAt.getTime())
    ) {
      throw new BadRequestException('Invalid openAt/closeAt');
    }

    if (nextOpenAt >= nextCloseAt) {
      throw new BadRequestException('openAt must be before closeAt');
    }

    const nextIsActive = this.computeIsActive(nextOpenAt, nextCloseAt);

    if (nextIsActive) {
      const activeSession = await this.prisma.attendanceSession.findFirst({
        where: {
          teachingAssigmentId: current.teachingAssigmentId,
          isActive: true,
          id: { not: sessionId },
        },
        select: { id: true },
      });

      if (activeSession) {
        throw new BadRequestException(
          'Another session is already active for this teaching assignment',
        );
      }
    }

    return this.repo.update(sessionId, {
      name: dto.name,
      openAt: dto.openAt ? nextOpenAt : undefined,
      closeAt: dto.closeAt ? nextCloseAt : undefined,
      isActive: nextIsActive,
    });
  }

  async getAttendanceSessions(teachingAssigmentId: number, teacherId: number) {
    await this.assertTeachingOwnedByTeacher(teachingAssigmentId, teacherId);

    const sessions = await this.repo.getAttendanceSession(teachingAssigmentId);

    return sessions.map((s) => {
      const total = s.teachingAssigment.class._count.students;
      const attended = s._count.attendances;

      return {
        id: s.id,
        name: s.name,
        isActive: s.isActive,
        openAt: s.openAt,
        closeAt: s.closeAt,
        attendedCount: attended,
        totalStudent: total,
        progress: `${attended}/${total}`,
      };
    });
  }
}
