import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AttendSessionDto } from './dto/attend-session.dto';
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

  async getDashboard(studentId: number) {
    const classId = await this.getClassId(studentId);

    const [assignments, attendanceSession] = await Promise.all([
      this.repo.countAssignmentsByClass(classId),
      this.repo.countActivateAttendanceSession(classId),
    ]);

    return { assignments, attendanceSession };
  }

  async submitAssignments(
    studentId: number,
    data: { assignmentId: number; fileUrl: string },
  ) {
    const assignment = await this.repo.findAssignmentById(data.assignmentId);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    const student = await this.repo.findStudentById(studentId);
    if (student?.classId !== assignment.teachingAssigment.classId) {
      throw new ForbiddenException('Student not in this class');
    }

    if (assignment.dueDate < new Date()) {
      throw new BadRequestException('Assignment already closed');
    }

    const exist = await this.repo.findSubmission(studentId, data.assignmentId);

    if (exist) {
      throw new BadRequestException('Submission already exist');
    }

    return this.repo.createSubmission({
      studentId: studentId,
      assignmentId: data.assignmentId,
      fileUrl: data.fileUrl,
    });
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
