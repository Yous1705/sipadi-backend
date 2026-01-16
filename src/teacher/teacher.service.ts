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
import { GradeSubmissionDto } from '../submission/dto/create-grade-submission.dto';
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

    return this.repo.getStudents(teaching.classId);
  }

  async getAssignment(teachingAssigmentId: number, teacherId: number) {
    const teaching = await this.teachingRepo.findById(teachingAssigmentId);

    if (!teaching || teaching?.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized teaching assignment');
    }

    return this.repo.getAssignment(teachingAssigmentId);
  }

  async getSubmission(asignmentId: number, teacherId: number) {
    return this.repo.getSubmission(asignmentId, teacherId);
  }

  async getHomeroomClass(teacherId: number) {
    const homeroom = await this.repo.findHomeroomClass(teacherId);

    if (!homeroom) {
      return null;
    }

    return {
      classId: homeroom.id,
      className: homeroom.name,
      subjects: homeroom.teachingAssigment.map((t) => ({
        teachingAssigmentId: t.id,
        subjectId: t.subject.id,
        subjectName: t.subject.name,
      })),
    };
  }
}
