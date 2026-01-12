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
      },
      select: {
        name: true,
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
}
