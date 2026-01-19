import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeachingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.teachingAssigment.findUnique({
      where: {
        id,
      },
    });
  }

  findAll() {
    return this.prisma.teachingAssigment.findMany({
      include: {
        teacher: true,
        class: true,
        subject: true,
      },
    });
  }

  findAllSubject() {
    return this.prisma.subject.findMany();
  }

  findExisting(teacherId: number, classId: number, subjectId: number) {
    return this.prisma.teachingAssigment.findFirst({
      where: {
        teacherId,
        classId,
        subjectId,
      },
    });
  }

  create(data: Prisma.TeachingAssigmentCreateInput) {
    return this.prisma.teachingAssigment.create({
      data,
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  delete(id: number) {
    return this.prisma.teachingAssigment.delete({
      where: {
        id,
      },
    });
  }
  deleteSubject(id: number) {
    return this.prisma.subject.delete({
      where: {
        id,
      },
    });
  }
}
