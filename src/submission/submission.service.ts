import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { SubmissionRepository } from './submission.repository';
import { AssignmentRepository } from 'src/assignment/assignment.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignmentStatus } from '@prisma/client';
import { GradeSubmissionDto } from './dto/create-grade-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly repo: SubmissionRepository,
    private readonly assignmentRepo: AssignmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async submit(dto: SubmitAssignmentDto, studentId: number) {
    const assignment = await this.assignmentRepo.findById(dto.assignmentId);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.status !== 'PUBLISHED') {
      throw new BadRequestException('Assignment not open');
    }

    if (new Date() > assignment.dueDate) {
      throw new BadRequestException('Assignment already closed');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    if (!student.classId) {
      throw new BadRequestException('Student not assigned to any class');
    }

    if (student.classId !== assignment.teachingAssigment.class.id) {
      throw new BadRequestException('Not your assignment');
    }

    return this.repo.upsertSubmission(studentId, dto.assignmentId, dto.fileUrl);
  }

  async gradeSubmission(
    submissionId: number,
    dto: GradeSubmissionDto,
    teacherId: number,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
      include: {
        assignment: {
          include: {
            teachingAssigment: true,
          },
        },
      },
    });

    if (!submission) {
      throw new BadRequestException('Submission not found');
    }

    if (submission.assignment.teachingAssigment.teacherId !== teacherId) {
      throw new ForbiddenException('not your submission');
    }

    return this.repo.grade(submissionId, dto, teacherId);
  }
}
