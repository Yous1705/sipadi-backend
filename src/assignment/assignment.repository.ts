import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.assignment.findUnique({
      where: {
        id,
      },
      include: {
        teachingAssigment: {
          include: {
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

  delete(id: number) {
    return this.prisma.assignment.delete({
      where: {
        id,
      },
    });
  }
}
