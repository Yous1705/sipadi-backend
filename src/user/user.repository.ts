import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  findActiveById(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id,
        isActive: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findByClass(classId: number) {
    return this.prisma.user.findMany({
      where: {
        classId,
        isActive: true, // optional, tapi bagus
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        classId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  findAllByRole(role: Role) {
    return this.prisma.user.findMany({
      where: {
        role,
        isActive: true,
      },
    });
  }

  deactivate(id: number) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  listUsers(params?: { role?: Role; isActive?: boolean }) {
    const where: any = {};
    if (params?.role) where.role = params.role;
    if (params?.isActive !== undefined) where.isActive = params.isActive;

    return this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        classId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  countUsers(where?: any) {
    return this.prisma.user.count({ where });
  }

  groupCountByRole() {
    return this.prisma.user.groupBy({
      by: ['role', 'isActive'],
      _count: { _all: true },
    });
  }
}
