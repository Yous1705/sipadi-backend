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

  private async assertStudentInClass(studentId: number, classId: number) {
    const s = await this.repo.getStudentClassId(studentId);
    if (!s?.classId) throw new ForbiddenException('Student has no class');
    if (s.classId !== classId)
      throw new ForbiddenException('Student not in this class');
    return s.classId;
  }

  async getDashboard(studentId: number) {
    const s = await this.repo.getStudentClassId(studentId);
    if (!s?.classId) {
      return { assignments: 0, attendanceSession: 0 };
    }

    const [assignments, attendanceSession] = await Promise.all([
      this.repo.countPublishedAssignmentsByClass(s.classId),
      this.repo.countActiveAttendanceSessionsByClass(s.classId),
    ]);

    return { assignments, attendanceSession };
  }

  async getMyClasses(studentId: number) {
    const data = await this.repo.findMyClasses(studentId);
    const cls = data?.class;

    if (!cls) return [];

    return cls.teachingAssigment.map((t) => ({
      classId: cls.id,
      className: `${cls.name} (${cls.year})`,
      teachingAssignmentId: t.id,
      subjectName: t.subject.name,
      teacherName: t.teacher.name,
    }));
  }

  async getClass(studentId: number, classId: number) {
    await this.assertStudentInClass(studentId, classId);

    const teachings = await this.repo.findClassDetail(classId, studentId);

    return {
      classId,
      subjects: teachings.map((t) => ({
        teachingAssignmentId: t.id,
        subjectName: t.subject.name,
        teacherName: t.teacher.name,

        assignments: t.assignment.map((a) => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          status: a.submissions.length ? 'SUBMITTED' : 'NOT_SUBMITTED',
          score: a.submissions[0]?.score ?? null,
        })),

        attendanceSessions: t.attendanceSession.map((s) => ({
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
      submissionPolicy: assignment.submissionPolicy,
      maxFileSizeMb: assignment.maxFileSizeMb,
      subjectName: assignment.teachingAssigment.subject.name,
      teacherName: assignment.teachingAssigment.teacher.name,
      className: assignment.teachingAssigment.class.name,
      classId: assignment.teachingAssigment.classId,
      teachingAssignmentId: assignment.teachingAssigmentId,

      submission: submission
        ? {
            id: submission.id,
            kind: submission.kind,
            url: submission.url,
            fileUrl: submission.fileUrl,
            submittedAt: submission.submittedAt,
            score: submission.score,
            feedback: submission.feedback,
          }
        : null,
    };
  }

  async getAttendanceSessionDetail(studentId: number, sessionId: number) {
    const s = await this.repo.findAttendanceSessionDetail(sessionId);
    if (!s) throw new NotFoundException('Attendance session not found');

    await this.assertStudentInClass(studentId, s.classId);

    return s;
  }

  async getActiveAttendanceByClass(studentId: number, classId: number) {
    await this.assertStudentInClass(studentId, classId);

    const sessions = await this.repo.findActiveAttendanceSessionsByClass(
      classId,
      studentId,
    );

    return sessions.map((s) => ({
      id: s.id,
      name: s.name,
      openAt: s.openAt,
      closeAt: s.closeAt,
      isActive: s.isActive,
      subjectName: s.teachingAssigment.subject.name,
      teacherName: s.teachingAssigment.teacher.name,
      isAttended: s.attendances.length > 0,
      status: s.attendances[0]?.status ?? null,
    }));
  }

  async getAttendanceHistoryByClass(studentId: number, classId: number) {
    await this.assertStudentInClass(studentId, classId);

    const sessions = await this.repo.findAttendanceHistoryByClass(
      classId,
      studentId,
      30,
    );

    return sessions.map((s) => ({
      id: s.id,
      name: s.name,
      openAt: s.openAt,
      closeAt: s.closeAt,
      isActive: s.isActive,
      subjectName: s.teachingAssigment.subject.name,
      teacherName: s.teachingAssigment.teacher.name,

      attendance: s.attendances.length
        ? {
            status: s.attendances[0].status,
            note: s.attendances[0].note,
            attendedAt: s.attendances[0].createdAt,
          }
        : null,
    }));
  }

  async getMySubjects(studentId: number) {
    const data = await this.repo.findMyClasses(studentId);
    const cls = data?.class;
    if (!cls) return [];

    return cls.teachingAssigment.map((t) => ({
      classId: cls.id,
      teachingAssigmentId: t.id,
      subjectName: t.subject.name,
      teacherName: t.teacher.name,
    }));
  }

  async getSubject(teachingAssigmentId: number, studentId: number) {
    const s = await this.repo.getStudentClassId(studentId);
    if (!s?.classId) throw new ForbiddenException('Student has no class');

    const detail = await this.repo.findSubjectDetail(
      s.classId,
      teachingAssigmentId,
      studentId,
    );

    if (!detail) throw new NotFoundException('Subject not found');

    return {
      teachingAssigmentId: detail.id,
      subjectName: detail.subject.name,
      teacherName: detail.teacher.name,
      classId: s.classId,

      assignments: detail.assignment.map((a) => ({
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        status: a.submissions.length ? 'SUBMITTED' : 'NOT_SUBMITTED',
        score: a.submissions[0]?.score ?? null,
      })),

      activeAttendanceSessions: detail.attendanceSession.map((sess) => ({
        id: sess.id,
        name: sess.name,
        openAt: sess.openAt,
        closeAt: sess.closeAt,
        isActive: sess.isActive,
        isAttended: sess.attendances.length > 0,
      })),
    };
  }
}
