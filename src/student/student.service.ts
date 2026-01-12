import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AttendSessionDto } from '../attendance/dto/attend-session.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentRepository } from './student.repository';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(private readonly repo: StudentRepository) {}

  private async getClassId(studentId: number) {
    const student = await this.repo.findStudentClass(studentId);

    if (!student?.classId) {
      throw new BadRequestException('Student not in class');
    }

    return student.classId;
  }

  async getAssignments(studentId: number) {
    const classId = await this.getClassId(studentId);
    return this.repo.findAssignmentsByClass(classId, studentId);
  }

  async getAssignmentsDetail(studentId: number, assignmentId: number) {
    const classId = await this.getClassId(studentId);

    const assignment = await this.repo.findAssignmentDetail(
      assignmentId,
      studentId,
    );

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.classId !== classId) {
      throw new ForbiddenException('Not your class assignment');
    }

    return assignment;
  }

  async getDashboard(studentId: number) {
    const classId = await this.getClassId(studentId);

    const [assignments, attendanceSession] = await Promise.all([
      this.repo.countAssignmentsByClass(classId),
      this.repo.countActivateAttendanceSession(classId),
    ]);

    return { assignments, attendanceSession };
  }

  async getMyAttendances(studentId: number) {
    return this.repo.findAttendances(studentId);
  }

  async attendSession(studentId: number, dto: AttendSessionDto) {
    const session = await this.repo.findAttendanceSession(
      dto.attendanceSessionId,
    );

    if (!session || !session.isActive) {
      throw new BadRequestException('Session not found or closed');
    }

    const student = await this.repo.findStudentById(studentId);
    if (student?.classId !== session.teachingAssigment.classId) {
      throw new ForbiddenException('Student not in this class');
    }

    const exist = await this.repo.findAttendance(
      studentId,
      dto.attendanceSessionId,
    );

    if (exist) {
      throw new BadRequestException('Attendance already exist');
    }

    if (
      (dto.status === AttendanceStatus.IZIN ||
        dto.status === AttendanceStatus.SAKIT) &&
      !dto.note
    ) {
      throw new BadRequestException('Note is required');
    }

    return this.repo.createAttendance({
      student: { connect: { id: studentId } },
      attendanceSession: { connect: { id: dto.attendanceSessionId } },
      teachingAssigment: { connect: { id: session.teachingAssigment.id } },
      status: dto.status,
      note: dto.note,
      createdBy: { connect: { id: studentId } },
    });
  }
}
