import { CreateAssignmentByTeacherDto } from './dto/create-assignment.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherRepository } from './teacher.repository';
import { UpdateAssignmentByTeacherDto } from './dto/update-assignment.dto';
import { InputAttendanceByTeacherDto } from './dto/input-attendance.dto';
import { UpdateInputAttendanceByTeacherDto } from './dto/update-input-attendance.dto';
import { GradeSubmissionDto } from './dto/create-grade-submission.dto';
import { TeachingRepository } from 'src/teaching/teaching.repository';

@Injectable()
export class TeacherService {
  constructor(
    private readonly repo: TeacherRepository,
    private readonly teachingRepo: TeachingRepository,
  ) {}

  getMyTeaching(teacherId: number) {
    return this.repo.getMyTeachings(teacherId);
  }

  async getStudents(teachingAssigmentId: number, teacherId: number) {
    const teaching = await this.teachingRepo.findById(teachingAssigmentId);

    if (!teaching || teaching?.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized teaching assignment');
    }

    return this.repo.getStudents(teachingAssigmentId);
  }

  async getAssignment(teachingAssigmentId: number, teacherId: number) {
    const teaching = await this.teachingRepo.findById(teachingAssigmentId);

    if (!teaching || teaching?.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized teaching assignment');
    }

    return this.repo.getAssignmet(teachingAssigmentId);
  }

  async getSubmission(asignmentId: number, teacherId: number) {
    return this.repo.getSubmission(asignmentId, teacherId);
  }

  // findMyTeachingAssignments(teacherId: number) {
  //   return this.repo.findMyTeachingAssignments(teacherId);
  // }

  // createAssignmet(teacherId: number, dto: CreateAssignmentByTeacherDto) {
  //   return this.repo.createAssignment(teacherId, dto);
  // }

  // updateAssignment(
  //   teacherId: number,
  //   assignmentId: number,
  //   dto: UpdateAssignmentByTeacherDto,
  // ) {
  //   return this.repo.updateAssignment(teacherId, assignmentId, dto);
  // }

  // deleteAssignment(teacherId: number, assignmentId: number) {
  //   return this.repo.deleteAssignment(teacherId, assignmentId);
  // }

  // inputAttendance(teacherId: number, dto: InputAttendanceByTeacherDto) {
  //   return this.repo.inputAttendance(teacherId, dto);
  // }

  // updateAttendance(
  //   teacherId: number,
  //   attendanceId: number,
  //   dto: UpdateInputAttendanceByTeacherDto,
  // ) {
  //   return this.repo.updateAttendance(teacherId, attendanceId, dto);
  // }

  // findSubmission(teacherId: number, assignmentId: number) {
  //   return this.repo.findSubmissions(teacherId, assignmentId);
  // }

  // gradeSubmission(teacherId: number, submissionId, dto: GradeSubmissionDto) {
  //   return this.repo.gradeSubmission(teacherId, submissionId, dto);
  // }

  // findStudentByTeachingAssignment(teacherId: number, assignmentId: number) {
  //   return this.repo.findStudentsByTeachingAssignment(teacherId, assignmentId);
  // }

  // findAttendance(teacherId: number, assignmentId: number) {
  //   return this.repo.findAttendance(teacherId, assignmentId);
  // }

  // getAssignmentDetail(teacherId: number, assignmentId: number) {
  //   return this.repo.getAssignmentDetail(teacherId, assignmentId);
  // }
}
