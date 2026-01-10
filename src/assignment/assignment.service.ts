import { BadRequestException, Injectable } from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { TeachingRepository } from 'src/teaching/teaching.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

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
      teachingAssigment: {
        connect: {
          id: dto.teachingAssigmentId,
        },
      },
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

    if (assignment?.teachingAssigment.teacherId !== teacherId) {
      throw new BadRequestException('Unauthorized teaching assignment');
    }
    return this.repo.delete(id);
  }
}
