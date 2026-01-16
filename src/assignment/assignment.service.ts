import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { TeachingRepository } from 'src/teaching/teaching.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentStatus, Prisma, SubmissionPolicy } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly repo: AssignmentRepository,
    private readonly teachingRepo: TeachingRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateAssignmentDto, teacherId: number) {
    const teaching = await this.teachingRepo.findById(dto.teachingAssigmentId);

    if (!teaching || teaching?.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized teaching assignment');
    }

    return this.repo.create({
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      submissionPolicy: dto.submissionPolicy ?? SubmissionPolicy.URL_ONLY,
      maxFileSizeMb: dto.maxFileSizeMb ?? 2,
      status: AssignmentStatus.DRAFT,
      teachingAssigment: {
        connect: {
          id: dto.teachingAssigmentId,
        },
      },
    });
  }

  async publish(id: number, teacherId: number) {
    const assignment = await this.repo.findById(id);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized');
    }

    if (assignment.status !== AssignmentStatus.DRAFT) {
      throw new BadRequestException('Only draft assignment can be published');
    }

    return this.repo.update(id, {
      status: AssignmentStatus.PUBLISHED,
    });
  }

  async close(id: number, teacherId: number) {
    const assignment = await this.repo.findById(id);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized');
    }

    if (assignment.status !== AssignmentStatus.PUBLISHED) {
      throw new BadRequestException('Only published assignment can be closed');
    }

    return this.repo.update(id, {
      status: AssignmentStatus.CLOSED,
    });
  }

  async updateAssignment(
    id: number,
    dto: UpdateAssignmentDto,
    teacherId: number,
  ) {
    const assignment = await this.repo.findById(id);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.status === AssignmentStatus.CLOSED) {
      throw new BadRequestException('Closed assignment cannot be updated');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized teaching assignment');
    }

    const updateData: Prisma.AssignmentUpdateInput = {
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
    } as Prisma.AssignmentUpdateInput;

    if (dto.dueDate) {
      const newDueDate = new Date(dto.dueDate);
      if (!isNaN(newDueDate.getTime()) && newDueDate.getTime() > Date.now()) {
        updateData.status = AssignmentStatus.PUBLISHED;
      }
    }

    return this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
    });
  }

  async delete(id: number, teacherId: number) {
    const assignment = await this.repo.findById(id);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized');
    }

    if (assignment.status === 'PUBLISHED') {
      throw new BadRequestException(
        'Published assignment must be closed first',
      );
    }

    return this.repo.softDelete(id);
  }

  async hardDelete(id: number, teacherId: number) {
    const assignment = await this.repo.findById(id);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized');
    }

    if (assignment.status === 'PUBLISHED') {
      throw new BadRequestException(
        'Published assignment must be closed first',
      );
    }

    return this.repo.hardDelete(id);
  }

  async findMyAssignmentsByClass(
    teacherId: number,
    teachingAssigmentId: number,
  ) {
    const teaching = await this.teachingRepo.findById(teachingAssigmentId);

    if (!teaching) {
      throw new BadRequestException('Teaching assignment not found');
    }

    if (teaching.teacherId !== teacherId) {
      throw new ForbiddenException('Access denied');
    }

    return this.repo.findMyAssignmentsByClass(teachingAssigmentId);
  }

  async findAssignmentById(id: number, teacherId: number) {
    const assignment = await this.repo.findById(id);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized teaching assignment');
    }
    return assignment;
  }

  async getAssignmentDetail(assignmentId: number, teacherId: number) {
    const assignment = await this.repo.findById(assignmentId);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized teaching assignment');
    }

    return this.repo.getAssignmentDetail(assignmentId);
  }
}
