import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
    const assignment = await this.repo.findAssignmentDetail(
      assignmentId,
      studentId,
    );

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const submission = assignment.submissions[0] ?? null;

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,

      subjectName: assignment.teachingAssigment.subject.name,
      teacherName: assignment.teachingAssigment.teacher.name,
      className: assignment.teachingAssigment.class.name,

      submission: submission
        ? {
            id: submission.id,
            fileUrl: submission.fileUrl,
            submittedAt: submission.submittedAt,
            score: submission.score,
            feedback: submission.feedback,
          }
        : null,
    };
  }

  async getDashboard(studentId: number) {
    const classId = await this.getClassId(studentId);

    const [assignments, attendanceSession] = await Promise.all([
      this.repo.countAssignmentsByClass(classId),
      this.repo.countActivateAttendanceSession(classId),
    ]);

    return { assignments, attendanceSession };
  }

  async getMyAttendance(studentId: number) {
    const student = await this.repo.findStudentById(studentId);

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const attendances = await this.repo.findAttendanceRecap(studentId);

    return attendances.map((a) => ({
      subject: a.subjectName,
      teacher: a.teacherName,
      totalSession: a.total,
      attendance: {
        HADIR: a.hadir,
        IZIN: a.izin,
        SAKIT: a.sakit,
        ALPHA: a.alpha,
      },
    }));
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

  async findMyClasses(studentId: number) {
    const student = await this.repo.findMyClasses(studentId);

    if (!student || !student.class) {
      return [];
    }

    return student.class.teachingAssigment.map((t) => ({
      classId: student.classId,
      className: student.class?.name,
      teachingAssignmentId: t.id,
      subjectName: t.subject.name,
      teacherName: t.teacher.name,
    }));
  }

  async getClassDetail(studentId: number, classId: number) {
    const student = await this.repo.findStudentClass(studentId);

    if (!student || student.classId !== classId) {
      throw new ForbiddenException('Not your class');
    }

    const teachingAssignments =
      await this.repo.findTeachingAssignmentsWithDetail(classId, studentId);

    return {
      classId,
      subjects: teachingAssignments.map((ta) => ({
        teachingAssignmentId: ta.id,
        subjectName: ta.subject.name,
        teacherName: ta.teacher.name,

        assignments: ta.assignment.map((a) => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          status: a.submissions.length ? 'SUBMITTED' : 'NOT_SUBMITTED',
          score: a.submissions[0]?.score ?? null,
        })),

        attendanceSessions: ta.attendanceSession.map((s) => ({
          id: s.id,
          name: s.name,
          openAt: s.openAt,
          closeAt: s.closeAt,
          isActive: s.isActive,
          isAttended: s.attendances.length > 0,
        })),
      })),
    };
  }

  async getAttendanceSessionDetail(studentId: number, sessionId: number) {
    const session = await this.repo.findAttendanceSessionDetail(sessionId);

    if (!session) {
      throw new BadRequestException('Attendance session not found');
    }

    const student = await this.repo.findStudentById(studentId);

    if (student?.classId !== session.classId) {
      throw new ForbiddenException('Not your class');
    }

    return {
      id: session.id,
      name: session.name,
      openAt: session.openAt,
      closeAt: session.closeAt,
      isActive: session.isActive,
      subjectName: session.subjectName,
      teacherName: session.teacherName,
    };
  }

  async getAssignmentsByTeaching(
    studentId: number,
    teachingAssignmentId: number,
  ) {
    const student = await this.repo.findStudentClass(studentId);

    if (!student?.classId) {
      throw new BadRequestException('Student not in class');
    }

    const teaching =
      await this.repo.findTeachingAssignmentById(teachingAssignmentId);

    if (!teaching) {
      throw new BadRequestException('Teaching assignment not found');
    }

    if (teaching.classId !== student.classId) {
      throw new ForbiddenException('Not your class');
    }

    return this.repo.findAssignmentsByTeaching(teachingAssignmentId, studentId);
  }
}
