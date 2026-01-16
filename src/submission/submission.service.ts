import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { SubmissionRepository } from './submission.repository';
import { AssignmentRepository } from 'src/assignment/assignment.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignmentStatus } from '@prisma/client';
import { GradeSubmissionDto } from './dto/create-grade-submission.dto';
import { stringify } from 'csv-stringify/sync';
import * as ExcelJS from 'exceljs';
import { ReportService } from 'src/report/report.service';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly repo: SubmissionRepository,
    private readonly assignmentRepo: AssignmentRepository,
    private readonly prisma: PrismaService,
    private readonly reportService: ReportService,
  ) {}

  async submit(
    assignmentId: number,
    dto: SubmitAssignmentDto,
    studentId: number,
  ) {
    const assignment = await this.assignmentRepo.findById(assignmentId);

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

    return this.repo.upsertSubmission(assignmentId, dto.fileUrl, studentId);
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

    if (dto.score < 0 || dto.score > 100) {
      throw new BadRequestException('Score must be between 0 and 100');
    }

    return this.repo.grade(submissionId, dto, teacherId);
  }

  async exportGradeReport(
    teachingId: number,
    teacherId: number,
    format: 'csv' | 'xlsx',
  ) {
    const report = await this.reportService.getGradeReport(
      teachingId,
      teacherId,
    );

    switch (format) {
      case 'csv':
        return this.reportService.exportCsv(report);
      case 'xlsx':
        return this.reportService.exportExcel(report);
      default:
        throw new BadRequestException('Unsupported export format');
    }
  }

  async resetGrade(submissionId: number, teacherId: number) {
    const submission = await this.repo.findSubmission(submissionId);

    if (!submission) {
      throw new NotFoundException();
    }

    if (
      !teacherId ||
      submission.assignment.teachingAssigment.teacherId !== teacherId
    ) {
      throw new ForbiddenException();
    }

    return this.repo.resetGrade(submissionId);
  }
}
