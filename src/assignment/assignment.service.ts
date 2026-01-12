import { BadRequestException, Injectable } from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { TeachingRepository } from 'src/teaching/teaching.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentStatus } from '@prisma/client';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly repo: AssignmentRepository,
    private readonly teachingRepo: TeachingRepository,
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

  async update(id: number, dto: UpdateAssignmentDto, teacherId: number) {
    const assignment = await this.repo.findById(id);

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized teaching assignment');
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

  findMyAssignments(teacherId: number) {
    return this.repo.findMyAssignments(teacherId);
  }
}
