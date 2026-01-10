import { BadRequestException, Injectable } from '@nestjs/common';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { SubmissionRepository } from './submission.repository';
import { AssignmentRepository } from 'src/assignment/assignment.repository';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly repo: SubmissionRepository,
    private readonly assignmentRepo: AssignmentRepository,
  ) {}

  async submit(dto: SubmitAssignmentDto, studentId: number) {
    const assignment = await this.assignmentRepo.findById(dto.assignmentId);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (new Date() > assignment.dueDate) {
      throw new BadRequestException('Assignment already closed');
    }

    const exist = await this.repo.findExisting(studentId, dto.assignmentId);

    if (exist) {
      throw new BadRequestException('Submission already exist');
    }

    return this.repo.create({
      fileUrl: dto.fileUrl,
      assignment: {
        connect: {
          id: dto.assignmentId,
        },
      },
      student: {
        connect: {
          id: studentId,
        },
      },
    });
  }
}
