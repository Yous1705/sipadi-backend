import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTeachingDto } from './dto/create-teaching.dto';
import { UpdateTeachingDto } from './dto/update-teaching.dto';
import { TeachingRepository } from './teaching.repository';
import { UserRepository } from 'src/user/user.repository';
import { ClassesRepository } from 'src/classes/classes.repository';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class TeachingService {
  constructor(
    private readonly repo: TeachingRepository,
    private readonly userRepo: UserRepository,
    private readonly classRepo: ClassesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async assignTeacher(dto: AssignTeacherDto) {
    const teacher = await this.userRepo.findById(dto.teacherId);
    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }

    const classes = await this.classRepo.findActiveById(dto.classId);
    if (!classes) {
      throw new BadRequestException('Class not found or inactive');
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });

    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    const exist = await this.repo.findExisting(
      dto.classId,
      dto.classId,
      dto.subjectId,
    );

    if (exist) {
      throw new BadRequestException('Teacher already assigned');
    }

    return this.repo.create({
      teacher: { connect: { id: dto.teacherId } },
      class: { connect: { id: dto.classId } },
      subject: { connect: { id: dto.subjectId } },
    });
  }

  async unassign(teachingAssigmentId: number) {
    const teaching = await this.repo.findById(teachingAssigmentId);

    if (!teaching) {
      throw new BadRequestException('Teaching assignment not found');
    }

    return this.repo.delete(teachingAssigmentId);
  }
}
