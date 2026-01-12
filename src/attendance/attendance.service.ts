import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceRepository } from './attendance.repository';
import { CreateAttendanceSessionDto } from './dto/create-session.dto';
import { AssignmentStatus, AttendanceStatus, Role } from '@prisma/client';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { StudentAttendanceDto } from './dto/student-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ======================
  //       ATTENDANCE
  // =======================

  async createAttendance(
    dto: CreateAttendanceDto,
    actor: {
      id: number;
      role: Role;
    },
  ) {
    const session = await this.repo.findSessionById(dto.attendanceSessionId);

    if (actor.role === Role.STUDENT) {
      const teaching = await this.prisma.teachingAssigment.findFirst({
        where: {
          id: session?.teachingAssigmentId,
          teacherId: actor.id,
        },
      });
      if (!teaching) {
        throw new BadRequestException('Not your class');
      }
    }

    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }

    const now = new Date();
    if (now < session.openAt || now > session.closeAt) {
      throw new BadRequestException('Session not active');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
      select: { classId: true },
    });

    if (!student || student.classId !== session.teachingAssigment.classId) {
      throw new BadRequestException('Student not in class');
    }

    const exist = await this.repo.findAttendance(
      dto.studentId,
      dto.attendanceSessionId,
    );

    if (exist) {
      throw new BadRequestException('Attendance already exist');
    }

    return this.repo.createAttendance({
      studentId: dto.studentId,
      teachingAssigmentId: session.teachingAssigmentId,
      attendanceSessionId: dto.attendanceSessionId,
      status: dto.status,
      note: dto.note,
      createById: actor.id,
    });
  }

  async updateAttendance(attendanceId: number, dto: UpdateAttendanceDto) {
    return this.repo.updateAttendance(attendanceId, dto);
  }
  getAllAttendances(filter) {
    return this.repo.findAll(filter);
  }
  listBySession(sessionId: number) {
    return this.repo.findBySession(sessionId);
  }

  async teacherUpdateAttendance(
    attendanceId: number,
    dto: UpdateAttendanceDto,
    teacherId: number,
  ) {
    const attendance = await this.repo.findById(attendanceId);

    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    if (attendance.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Forbidden');
    }

    return this.repo.updateAttendance(attendanceId, dto);
  }

  async bulkCreateAttendance(dto: BulkAttendanceDto, teacherId: number) {
    const session = await this.repo.findSessionById(dto.attendanceSessionId);

    if (!session || !session.isActive) {
      throw new BadRequestException('Session not active');
    }

    if (session.teachingAssigment.teacherId !== teacherId) {
      throw new ForbiddenException('Forbidden');
    }

    const students = await this.repo.findStudentByClass(
      session.teachingAssigment.classId,
    );

    if (students.length === 0) {
      throw new BadRequestException('No students in class');
    }

    return this.repo.bulkCreateAttendance(
      dto.students.map((s) => ({
        studentId: s.studentId,
        attendanceSessionId: dto.attendanceSessionId,
        teachingAssigmentId: session.teachingAssigmentId,
        status: s.status,
        note: s.note ?? null,
        createById: teacherId,
      })),
    );
  }

  async studentAttend(dto: StudentAttendanceDto, studentId: number) {
    const session = await this.repo.findSessionById(dto.attendanceSessionId);

    if (!session || !session.isActive) {
      throw new BadRequestException('Session not active');
    }

    const now = new Date();
    if (now < session.openAt || now > session.closeAt) {
      throw new BadRequestException('Outside attendance time');
    }

    const classId = session.teachingAssigment.classId;
    const isStudentInClass = session.teachingAssigment.class.students.some(
      (s) => s.id === studentId,
    );

    if (!classId) {
      throw new BadRequestException('Class not found');
    }

    if (!isStudentInClass) {
      throw new BadRequestException('Not your class');
    }

    const exist = await this.repo.findAttendance(
      studentId,
      dto.attendanceSessionId,
    );

    if (exist) {
      throw new BadRequestException('Already attended');
    }

    return this.repo.createAttendance({
      studentId,
      attendanceSessionId: dto.attendanceSessionId,
      teachingAssigmentId: session.teachingAssigmentId,
      status: AttendanceStatus.HADIR,
      createById: studentId,
    });
  }
}
