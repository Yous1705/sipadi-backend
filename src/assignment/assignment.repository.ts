import { Injectable } from '@nestjs/common';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureClosedIfOverdueById(id: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      select: { id: true, status: true, dueDate: true },
    });

    if (
      assignment &&
      assignment.status === AssignmentStatus.PUBLISHED &&
      assignment.dueDate &&
      assignment.dueDate.getTime() < Date.now()
    ) {
      await this.prisma.assignment.update({
        where: { id },
        data: { status: AssignmentStatus.CLOSED },
      });
    }
  }

  private async closeOverdueForTeaching(teachingAssigmentId: number) {
    await this.prisma.assignment.updateMany({
      where: {
        teachingAssigmentId,
        status: AssignmentStatus.PUBLISHED,
        dueDate: { lt: new Date() },
        deletedAt: null,
      },
      data: {
        status: AssignmentStatus.CLOSED,
      },
    });
  }

  async findById(id: number) {
    await this.ensureClosedIfOverdueById(id);

    return this.prisma.assignment.findFirst({
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
        submissions: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                name: true,
              },
            },
            score: true,
            fileUrl: true,
            feedback: true,
            submittedAt: true,
          },
          orderBy: {
            student: { name: 'asc' },
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

  hardDelete(id: number) {
    return this.prisma.assignment.delete({
      where: { id },
    });
  }

  async findMyAssignmentsByClass(teachingAssigmentId: number) {
    await this.closeOverdueForTeaching(teachingAssigmentId);

    return this.prisma.assignment.findMany({
      where: {
        teachingAssigmentId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAssignmentDetail(assignmentId: number) {
    await this.ensureClosedIfOverdueById(assignmentId);

    return this.prisma.assignment.findFirst({
      where: { id: assignmentId, deletedAt: null },
      include: {
        teachingAssigment: {
          include: {
            class: {
              select: { id: true },
            },
            teacher: true,
          },
        },
        submissions: {
          select: {
            fileUrl: true,
            score: true,
          },
        },
      },
    });
  }
}
