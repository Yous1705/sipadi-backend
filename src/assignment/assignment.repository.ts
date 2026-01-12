import { Injectable } from '@nestjs/common';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.assignment.findUnique({
      where: { id, deletedAt: null },
      include: {
        teachingAssigment: {
          include: {
            class: {
              select: { id: true },
            },
            teacher: true,
          },
        },
      },
    });
  }

  create(data: Prisma.AssignmentCreateInput) {
    return this.prisma.assignment.create({ data });
  }

  update(id: number, data: Prisma.AssignmentUpdateInput) {
    return this.prisma.assignment.update({
      where: {
        id,
      },
      data,
    });
  }

  softDelete(id: number) {
    return this.prisma.assignment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: AssignmentStatus.CLOSED,
      },
    });
  }

  findMyAssignments(teacherId: number) {
    return this.prisma.assignment.findMany({
      where: { deletedAt: null, teachingAssigment: { teacherId } },
    });
  }
}
