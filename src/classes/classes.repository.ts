import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { disconnect } from 'process';
import { connect } from 'http2';

@Injectable()
export class ClassesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.class.findUnique({
      where: {
        id,
      },
      include: {
        homeroomTeacher: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findActiveById(id: number) {
    return this.prisma.class.findFirst({
      where: {
        id,
        isActive: true,
      },
    });
  }

  findByNameAndYear(name: string, year: number) {
    return this.prisma.class.findFirst({
      where: {
        name,
        year,
      },
    });
  }

  create(data: Prisma.ClassCreateInput) {
    return this.prisma.class.create({ data });
  }

  update(id: number, data: Prisma.ClassUpdateInput) {
    return this.prisma.class.update({
      where: {
        id,
      },
      data,
    });
  }

  deactivate(id: number) {
    return this.update(id, {
      isActive: false,
      homeroomTeacher: {
        disconnect: true,
      },
    });
  }

  assignHomeroomTeacher(classId: number, teacherId: number) {
    return this.update(classId, {
      homeroomTeacher: {
        connect: {
          id: teacherId,
        },
      },
    });
  }

  removeHomeroomTeacher(classId: number) {
    return this.update(classId, {
      homeroomTeacher: {
        disconnect: true,
      },
    });
  }

  findAll() {
    return this.prisma.class.findMany();
  }
}
